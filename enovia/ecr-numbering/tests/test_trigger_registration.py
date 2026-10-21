import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("registration", Path(__file__).resolve().parents[1] / "prepare_trigger_registration.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RegistrationTest(unittest.TestCase):
    def test_preserves_entire_inherited_input_and_macro(self):
        text = module.render("sdxECChangeAction", "emxTriggerManager",
                             "TypeAllCreateAction TypeChangeActionCreateAction", 100)
        self.assertIn('input "TypeAllCreateAction TypeChangeActionCreateAction TypesdxECChangeActionCreateActionEcrNumber"', text)
        self.assertIn('"eService Program Argument 1" "${OBJECTID}"', text)
        self.assertIn('"eService Error Type" "Error"', text)

    def test_does_not_replace_custom_program_or_empty_manager(self):
        for program, inputs in [("customProgram", "old"), ("emxTriggerManager", ""), ("none", "old")]:
            with self.assertRaises(ValueError):
                module.render("sdxECChangeAction", program, inputs, 100)

    def test_rejects_duplicate_and_injection(self):
        for inputs in ['TypesdxECChangeActionCreateActionEcrNumber', 'old"; delete type Part;']:
            with self.assertRaises(ValueError):
                module.render("sdxECChangeAction", "emxTriggerManager", inputs, 100)
        with self.assertRaises(ValueError):
            module.render("sdxECChangeAction", "none", "", 0)

    def test_new_chain_is_explicit(self):
        text = module.render("sdxECChangeAction", "none", "", 1)
        self.assertIn('input "TypesdxECChangeActionCreateActionEcrNumber"', text)


if __name__ == "__main__":
    unittest.main()
