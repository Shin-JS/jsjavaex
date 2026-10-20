"""Patch the existing CA adapter Java source; do not decompile or replace its body.

Usage: python3 apply_r2024x_adapter_patch.py PATH/ENONewChangeActionApplicationAdapter.java
The first in-place application creates PATH.pre-ecr.bak. Repeated application is a no-op.
"""
import argparse
import re
from pathlib import Path

MARKER = "// SDX ECR: allocate the final name in the existing create transaction."
CLASS_NAME = "ENONewChangeActionApplicationAdapter"
TYPE_PREFIX = r"(?:[A-Za-z_$][\w$]*\.)*"
METHOD = re.compile(
    r"\bprivate\s+" + TYPE_PREFIX + r"BusinessObject\s+createBusinessObject\s*\(\s*"
    + TYPE_PREFIX + r"Context\s+(?P<context>[A-Za-z_$][\w$]*)\s*,\s*"
    + TYPE_PREFIX + r"CreateParameters\s+(?P<parameters>[A-Za-z_$][\w$]*)\s*\)"
    r"\s*throws\s+" + TYPE_PREFIX + r"ENONewAppException\s*\{"
)


def patch_text(source):
    if not re.search(r"\bclass\s+" + CLASS_NAME + r"\b", source):
        raise ValueError("Wrong source class; expected " + CLASS_NAME)
    matches = list(METHOD.finditer(source))
    if len(matches) != 1:
        raise ValueError("Expected exactly one verified private createBusinessObject signature")
    match = matches[0]
    newline = "\r\n" if "\r\n" in source else "\n"
    indent_start = source.rfind("\n", 0, match.start()) + 1
    indent = re.match(r"[ \t]*", source[indent_start:match.start()]).group() + "    "
    call = "com.sdx.enovia.ecr.SdxEcrNameHook.apply(" + match["context"] + ", " + match["parameters"] + ");"
    inserted = newline + indent + MARKER + newline + indent + call
    if MARKER in source:
        if source[match.end():].startswith(inserted):
            return source
        raise ValueError("An inconsistent ECR marker exists; inspect the source instead of adding a second hook")
    return source[:match.end()] + inserted + source[match.end():]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    raw = args.source.read_bytes()
    source = raw.decode("utf-8")
    patched = patch_text(source)
    if patched == source:
        print("Already patched: " + str(args.source))
        return
    backup = args.source.with_name(args.source.name + ".pre-ecr.bak")
    if backup.exists():
        raise SystemExit("Backup exists; inspect the previous patch before replacing: " + str(backup))
    backup.write_bytes(raw)
    args.source.write_bytes(patched.encode("utf-8"))
    print("Patched: " + str(args.source))
    print("Backup: " + str(backup))


if __name__ == "__main__":
    main()
