"""Compile production sources against the installed/reference SDK. Never uses stubs."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("jar_directory", type=Path)
parser.add_argument("--output", type=Path, default=root / "build/sdk")
args = parser.parse_args()
names = ["eMatrixServletRMI.jar", "NewContentWebServices.jar"]
jars = [args.jar_directory / name for name in names]
for path in jars:
    if not path.is_file() or path.stat().st_size == 0:
        raise SystemExit("Missing SDK JAR: " + str(path))
args.output.mkdir(parents=True, exist_ok=True)
java = shutil.which("java")
if not java:
    raise SystemExit("JDK 17+ required")
sources = sorted(str(path) for path in (root / "src").rglob("*.java"))
subprocess.run([java, "-m", "jdk.compiler/com.sun.tools.javac.Main", "--release", "8",
                "-classpath", os.pathsep.join(str(path) for path in jars),
                "-d", str(args.output), *sources], check=True)
print("PASS: production sources compile against SDK; no test doubles used")
