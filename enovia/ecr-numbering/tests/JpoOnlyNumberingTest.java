import matrix.db.Context;
import matrix.db.MQLCommand;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** Command-flow doubles; does NOT prove real database uniqueness/rollback. */
public class JpoOnlyNumberingTest {
    private static final String PREFIX = "ECR-W" + LocalDate.now(ZoneId.of("Asia/Seoul"))
            .format(DateTimeFormatter.ofPattern("yyMMdd"));
    static class Fixture {
        String name = "temporary";
        String type = "sdxECChangeAction";
        String policy = "sdxECR";
        int max = 0;
        int renames = 0;
        boolean conflict, permissionFailure, aborted, changedName;
        Context context = new Context();
        void install() {
            MQLCommand.handler = (cmd, args) -> {
                if (cmd.startsWith("print")) {
                    if (cmd.contains("select type")) return type;
                    if (cmd.contains("select policy")) return policy;
                    if (cmd.contains("select revision")) return "";
                    return name;
                }
                if (cmd.contains("select id")) return conflict
                        ? type + "|" + PREFIX + "0001||other-id" : "";
                if (cmd.startsWith("temp")) return max == 0 ? ""
                        : type + "|" + PREFIX + sdxEcrNumbering_mxJPO.suffix(max)
                        + "||" + PREFIX + sdxEcrNumbering_mxJPO.suffix(max);
                if (cmd.startsWith("modify")) {
                    renames++;
                    if (permissionFailure) throw new Exception("permission denied");
                    if (conflict && renames == 1) {
                        max = 1;
                        if (aborted) context.transactionType = 0;
                        throw new Exception("simulated duplicate");
                    }
                    name = changedName ? "changed-by-trigger" : args.get(1);
                    return "";
                }
                throw new AssertionError(cmd);
            };
        }
        void run() throws Exception {
            install();
            new sdxEcrNumbering_mxJPO(context, null) {
                protected String resolveDivision(Context ignored) { return "MX"; }
            }.createAction(context, new String[]{"own-id"});
        }
    }
    static void check(boolean value) { if (!value) throw new AssertionError(); }
    static void fails(Fixture f) throws Exception {
        try { f.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected failure");
    }
    public static void main(String[] args) throws Exception {
        for (int i = 1; i <= 35973; i++) {
            check(sdxEcrNumbering_mxJPO.ordinal(sdxEcrNumbering_mxJPO.suffix(i)) == i);
        }
        check("A001".equals(sdxEcrNumbering_mxJPO.suffix(10000)));
        check("B001".equals(sdxEcrNumbering_mxJPO.suffix(10999)));
        Fixture f = new Fixture(); f.run(); check(f.name.equals(PREFIX + "0001"));
        f = new Fixture(); f.max = 10998; f.run(); check(f.name.endsWith("B001"));
        f = new Fixture(); f.conflict = true; f.run();
        check(f.renames == 2 && f.name.equals(PREFIX + "0002"));
        f = new Fixture(); f.permissionFailure = true; fails(f); check(f.renames == 1);
        f = new Fixture(); f.conflict = true; f.aborted = true; fails(f); check(f.renames == 1);
        f = new Fixture(); f.changedName = true; fails(f); check(f.renames == 1);
        f = new Fixture(); f.max = 35973; fails(f); check(f.renames == 0);
        f = new Fixture(); f.policy = "sdxECO"; f.run(); check(f.renames == 0);
        f = new Fixture(); f.type = "Change Action"; f.run(); check(f.renames == 0);
        f = new Fixture(); f.policy = "Change Action"; fails(f);
        f = new Fixture(); f.name = "ECR-W2610210001"; f.run(); check(f.renames == 0);
        f = new Fixture(); f.name = "ECR-W2610210000"; fails(f);
        f = new Fixture(); f.install();
        try {
            new sdxEcrNumbering_mxJPO(f.context, null).createAction(f.context, new String[]{"own-id"});
            throw new AssertionError("Missing division mapping must fail");
        } catch (IllegalStateException expected) { }
        System.out.println("JPO-only numbering checks passed (command-flow doubles)");
    }
}
