"""Prepare, but never execute, MQL after inspecting the effective Create Action chain."""
import argparse
from pathlib import Path


def quoted(value):
    if any(char in value for char in ('"', '\\', '\n', '\r', ';', '$', '{', '}')):
        raise ValueError("Unsupported character in MQL configuration")
    return '"' + value + '"'


def render(target_type, program, existing_input, sequence):
    quoted(target_type)
    if program not in ("none", "emxTriggerManager"):
        raise ValueError("A direct/custom existing program needs a reviewed wrapper; it cannot be replaced")
    if program == "none" and existing_input:
        raise ValueError("none cannot have existing input")
    if program == "emxTriggerManager" and not existing_input.strip():
        raise ValueError("Provide the complete existing manager input, including inherited rules")
    if sequence < 1:
        raise ValueError("Sequence must be positive and ordered after the inspected existing rules")
    custom = "TypesdxECChangeActionCreateActionEcrNumber"
    inputs = existing_input.split()
    if custom in inputs:
        raise ValueError("ECR rule already present; inspect the current registration instead of adding it again")
    combined = " ".join(inputs + [custom])
    return '''# Generated review artifact. Run in MQL only after TRIGGER-INTEGRATION.md steps.
# This does not insert/compile the JPO or deploy its Java dependencies.
# Existing effective Create Action manager input is preserved below.
add bus "eService Trigger Program Parameters" "TypesdxECChangeActionCreateActionEcrNumber" "EcrNumbering" policy "eService Trigger Program Policy" vault "eService Administration" owner "creator" "eService Program Name" "sdxEcrNumbering" "eService Method Name" "createAction" "eService Sequence Number" "''' + str(sequence) + '''" "eService Program Argument 1" "${OBJECTID}" "eService Error Type" "Error";
promote bus "eService Trigger Program Parameters" "TypesdxECChangeActionCreateActionEcrNumber" "EcrNumbering";
modify type ''' + quoted(target_type) + ''' add trigger create action emxTriggerManager input ''' + quoted(combined) + ''';
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--type", default="sdxECChangeAction", dest="target_type")
    parser.add_argument("--existing-program", required=True, choices=("none", "emxTriggerManager"))
    parser.add_argument("--existing-input", required=True)
    parser.add_argument("--sequence", required=True, type=int)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    content = render(args.target_type, args.existing_program, args.existing_input, args.sequence)
    # Refuse overwrite: preserve the previously reviewed registration artifact.
    with args.output.open("x", encoding="utf-8") as out:
        out.write(content)
    print("Prepared only (not executed):", args.output)


if __name__ == "__main__":
    main()
