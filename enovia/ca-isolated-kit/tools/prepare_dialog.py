#!/usr/bin/env python3
"""Extract ONE local installed AMD module into a private namespace.

No network; never edits the input. Node checks syntax before writing output.
Use the exact ENONewWidget.js from the target installation.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

ORIGINAL = "DS/ENONewWidget/ENONew/Controller/ENONewDialogController"
CUSTOM = "ZCAChangeAction/vendor/DialogController"
OLD_HELPER = "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper"
NEW_HELPER = "ZCAChangeAction/FacetHelper"


def prepare(source_path, output_dir):
    source_path = source_path.resolve()
    output_dir = output_dir.resolve()
    output_path = output_dir / "DialogController.js"
    if output_path == source_path:
        raise ValueError("Input must not be overwritten")
    before = source_path.read_bytes()
    text = before.decode("utf-8-sig")
    definitions = list(re.finditer(r"\bdefine\s*\(\s*([\"'])([^\"']+)\1", text))
    matching = [index for index, match in enumerate(definitions)
                if match.group(2) == ORIGINAL]
    if len(matching) != 1:
        raise ValueError("Expected exactly one named DialogController module; inspect this version")
    index = matching[0]
    start = definitions[index].start()
    end = definitions[index + 1].start() if index + 1 < len(definitions) else len(text)
    module = text[start:end].rstrip()
    # The known reference bundle separates define(...) calls with a comma.
    if module.endswith(","):
        module = module[:-1].rstrip() + ";"
    if module.count(ORIGINAL) != 1 or module.count(OLD_HELPER) != 1:
        raise ValueError("Dependency layout differs from the verified reference; manual adaptation needed")
    module = module.replace(ORIGINAL, CUSTOM, 1).replace(OLD_HELPER, NEW_HELPER, 1)
    if ORIGINAL in module or OLD_HELPER in module:
        raise ValueError("Original module mapping remains")
    # A layout mismatch must fail rather than emit a partially extracted module.
    with tempfile.NamedTemporaryFile(suffix=".js", mode="w", encoding="utf-8", delete=False) as tmp:
        tmp.write(module + "\n")
        temporary_path = Path(tmp.name)
    try:
        subprocess.run(["node", "--check", str(temporary_path)], check=True)
    finally:
        temporary_path.unlink(missing_ok=True)
    if source_path.read_bytes() != before:
        raise ValueError("Input file changed during preparation; retry with an immutable copy")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path.write_text(module + "\n", encoding="utf-8")
    manifest = {
        "source_path": str(source_path),
        "source_sha256": hashlib.sha256(before).hexdigest(),
        "source_module": ORIGINAL,
        "output_module": CUSTOM,
        "output_sha256": hashlib.sha256(output_path.read_bytes()).hexdigest(),
        "changes": ["AMD module ID", "facet helper dependency"],
        "source_modified": False
    }
    (output_dir / "source-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    print(json.dumps(prepare(args.source, args.output_dir), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
