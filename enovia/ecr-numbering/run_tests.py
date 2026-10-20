"""Compile Java 8-compatible sources against isolated test-only SDK doubles."""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
java = shutil.which("java")
if not java:
    raise SystemExit("JDK 17+ is required to run this test command")
sources = sorted(str(p) for directory in (root / "src", root / "tests") for p in directory.rglob("*.java"))
with tempfile.TemporaryDirectory(prefix="ecr-tests-") as output:
    subprocess.run([java, "-m", "jdk.compiler/com.sun.tools.javac.Main", "--release", "8",
                    "-d", output, *sources], check=True)
    subprocess.run([java, "-cp", output, "com.sdx.enovia.ecr.EcrNumberingTest"], check=True)
