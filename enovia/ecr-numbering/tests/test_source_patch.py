"""Source-edit checks independent of the vendor implementation."""
import importlib.util
from pathlib import Path
import unittest

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("adapter_patch", root / "apply_r2024x_adapter_patch.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SourcePatchTest(unittest.TestCase):
    def fixture(self, newline="\n", context="context", parameters="createParameters"):
        return newline.join([
            "public class ENONewChangeActionApplicationAdapter {",
            "    private BusinessObject createBusinessObject(Context " + context + ", CreateParameters " + parameters + ") throws ENONewAppException {",
            "        return " + parameters + ".exec(" + context + ");",
            "    }", "}", "",
        ])

    def test_changes_only_one_insertion(self):
        original = self.fixture()
        patched = module.patch_text(original)
        start = patched.index("\n        " + module.MARKER)
        end = patched.index("\n        return", start)
        self.assertEqual(original, patched[:start] + patched[end:])
        self.assertEqual(1, patched.count("SdxEcrNameHook.apply("))

    def test_idempotent(self):
        once = module.patch_text(self.fixture())
        self.assertEqual(once, module.patch_text(once))

    def test_windows_and_actual_local_names(self):
        patched = module.patch_text(self.fixture("\r\n", "ctx", "params"))
        self.assertIn("SdxEcrNameHook.apply(ctx, params);\r\n", patched)
        self.assertNotIn("\n", patched.replace("\r\n", ""))

    def test_reject_wrong_signature_or_class(self):
        for source in [self.fixture().replace("private BusinessObject", "public BusinessObject"),
                       self.fixture().replace("ENONewChangeActionApplicationAdapter", "OtherAdapter"),
                       self.fixture() + self.fixture(),
                       self.fixture().replace("throws ENONewAppException", "throws Exception")]:
            with self.assertRaises(ValueError):
                module.patch_text(source)


if __name__ == "__main__":
    unittest.main()
