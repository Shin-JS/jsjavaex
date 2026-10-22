"""Test the single-method JPO using SDK doubles and a temporary division mapping."""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
java = shutil.which("java")
if not java:
    raise SystemExit("JDK 17+ is required")
source = (root / "jpo/sdxEcrNumbering_mxJPO.java").read_text(encoding="utf-8")
marker = '// users.put("REAL_LOGIN_NAME", "MX");'
if source.count(marker) != 1:
    raise SystemExit("Expected exactly one division configuration marker")
stubs = sorted(str(p) for p in (root / "tests/stubs").rglob("*.java"))
with tempfile.TemporaryDirectory(prefix="ecr-single-method-") as output:
    # Compile the unconfigured deployment source as well. Do not overwrite it.
    subprocess.run([java, "-m", "jdk.compiler/com.sun.tools.javac.Main", "--release", "8",
                    "-d", str(Path(output) / "unconfigured"),
                    *stubs, str(root / "jpo/sdxEcrNumbering_mxJPO.java")], check=True)
    configured = Path(output) / "sdxEcrNumbering_mxJPO.java"
    # Test-only login mapping; no behavior or argument changes in the test copy.
    configured.write_text(source.replace(marker, 'users.put("test-user", "MX");'), encoding="utf-8")
    subprocess.run([java, "-m", "jdk.compiler/com.sun.tools.javac.Main", "--release", "8",
                    "-d", output, *stubs, str(configured),
                    str(root / "tests/JpoOnlyNumberingTest.java")], check=True)
    subprocess.run([java, "-cp", output, "JpoOnlyNumberingTest"], check=True)
