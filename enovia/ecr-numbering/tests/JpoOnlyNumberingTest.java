import matrix.db.Context;
import matrix.db.MQLCommand;
import com.matrixone.apps.domain.DomainObject;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** Command-flow doubles; does NOT prove real database uniqueness/rollback. */
public class JpoOnlyNumberingTest {
    private static final String DAY = LocalDate.now(ZoneId.of("Asia/Seoul"))
            .format(DateTimeFormatter.ofPattern("yyMMdd"));
    static class Fixture {
        String name = "temporary";
        String type = "sdxECChangeAction";
        String policy = "sdxECR";
        String maxSuffix = null;
        int renames = 0;
        boolean conflict, permissionFailure, aborted, changedName;
        Context context = new Context();
        String prefix() { return ("sdxECO".equals(policy) ? "ECO-W" : "ECR-W") + DAY; }
        void install() {
            DomainObject.nameHandler = (ctx, id, candidate) -> {
                check(ctx == context && "own-id".equals(id));
                renames++;
                if (permissionFailure) throw new Exception("permission denied");
                if (conflict && renames == 1) {
                    maxSuffix = "0001";
                    if (aborted) context.transactionType = 0;
                    throw new Exception("simulated duplicate");
                }
                name = changedName ? "changed-by-trigger" : candidate;
            };
            MQLCommand.handler = (cmd, args) -> {
                if (cmd.startsWith("print")) {
                    if (cmd.contains("sdxECType") || args.contains("attribute[sdxECType]")) {
                        throw new AssertionError("Create Action must not query the not-yet-saved sdxECType");
                    }
                    if (cmd.contains("select type")) return type;
                    if (cmd.contains("select policy")) return policy;
                    if (cmd.contains("select revision")) return "";
                    return name;
                }
                if (cmd.contains("select id")) {
                    check(args.get(1).equals(prefix() + "0001"));
                    return conflict ? type + "|" + prefix() + "0001||other-id" : "";
                }
                if (cmd.startsWith("temp")) {
                    // Exact series restriction is part of every max-number query.
                    check(args.get(1).equals(prefix() + "*"));
                    return maxSuffix == null ? ""
                        : type + "|" + prefix() + maxSuffix + "||" + prefix() + maxSuffix;
                }
                if (cmd.startsWith("modify")) throw new AssertionError("Rename must use DomainObject.setName");
                throw new AssertionError(cmd);
            };
        }
        void run() throws Exception {
            install();
            new sdxEcrNumbering_mxJPO(context, null).createAction(context, new String[]{"own-id"});
        }
    }
    static Fixture fixture(String policy) { Fixture f = new Fixture(); f.policy = policy; return f; }
    static void check(boolean value) { if (!value) throw new AssertionError(); }
    static void fails(Fixture f) throws Exception {
        try { f.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected failure");
    }
    public static void main(String[] args) throws Exception {
        for (String policy : new String[]{"sdxECR", "sdxECO"}) {
            String kind = policy.substring(3), prefix = kind + "-W" + DAY;
            Fixture f = fixture(policy); f.run(); check(f.name.equals(prefix + "0001"));
            f = fixture(policy); f.maxSuffix = "A999"; f.run(); check(f.name.equals(prefix + "B001"));
            f = fixture(policy); f.conflict = true; f.run();
            check(f.renames == 2 && f.name.equals(prefix + "0002"));
            f = fixture(policy); f.permissionFailure = true; fails(f); check(f.renames == 1);
            f = fixture(policy); f.conflict = true; f.aborted = true; fails(f); check(f.renames == 1);
            f = fixture(policy); f.changedName = true; fails(f); check(f.renames == 1);
            f = fixture(policy); f.maxSuffix = "Z999"; fails(f); check(f.renames == 0);
            f = fixture(policy); f.name = kind + "-W2610210001"; f.run(); check(f.renames == 0);
            f = fixture(policy); f.name = kind + "-W261021A001"; f.run(); check(f.renames == 0);
            for (String invalid : new String[]{"-W2610210000", "-W261021A000", "-W2602300001"}) {
                f = fixture(policy); f.name = kind + invalid; fails(f); check(f.renames == 0);
            }
            f = fixture(policy); f.name = (kind.equals("ECR") ? "ECO" : "ECR") + "-W2610210001";
            fails(f); check(f.renames == 0);
            f = fixture(policy); f.context.user = "unmapped-user"; fails(f);
            f = fixture(policy); f.maxSuffix = "9999"; f.run(); check(f.name.equals(prefix + "A001"));
            f = fixture(policy); f.maxSuffix = "Z998"; f.run(); check(f.name.equals(prefix + "Z999"));
            f = fixture(policy); f.maxSuffix = "A000"; fails(f); check(f.renames == 0);
            f = fixture(policy); f.install();
            for (String[] badArgs : new String[][]{null, {}, {"own-id", "MX"}, {"${OBJECTID}"}, {""}}) {
                try {
                    new sdxEcrNumbering_mxJPO(f.context, null).createAction(f.context, badArgs);
                    throw new AssertionError("Expected exactly one resolved objectId");
                } catch (IllegalArgumentException expected) { }
            }
        }
        // Different policies start independent series even on the same day/division.
        Fixture ecr = fixture("sdxECR"); ecr.maxSuffix = "0042"; ecr.run();
        Fixture eco = fixture("sdxECO"); eco.run();
        check(ecr.name.equals("ECR-W" + DAY + "0043"));
        check(eco.name.equals("ECO-W" + DAY + "0001"));
        Fixture f = new Fixture(); f.type = "Change Action"; f.run(); check(f.renames == 0);
        f = new Fixture(); f.policy = "Change Action"; fails(f);
        check(sdxEcrNumbering_mxJPO.class.getDeclaredMethods().length == 1);
        System.out.println("ECR/ECO JPO numbering checks passed (command-flow doubles; real DB concurrency not simulated)");
    }
}
