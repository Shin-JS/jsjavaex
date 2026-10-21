package com.sdx.enovia.ecr;

import matrix.db.BusinessObject;
import matrix.db.Context;
import matrix.db.CreateParameters;
import matrix.db.MQLCommand;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/** Behavioral checks only: SDK doubles cannot establish real locking/rollback semantics. */
public final class EcrCreateActionTest {
    private static int assertions;
    private static String type, policy, name;
    private static boolean renameFails, overwrite;
    private static final List<String> commands = new ArrayList<>();
    private static final Context context = new Context();
    private static final Clock clock = Clock.fixed(Instant.parse("2026-10-20T15:00:00Z"), ZoneOffset.UTC);
    private static Properties properties;
    private interface Work { void run() throws Exception; }
    private static void equal(Object expected, Object actual) {
        assertions++;
        if (!expected.equals(actual)) throw new AssertionError(expected + " != " + actual);
    }
    private static void fails(Work action) throws Exception {
        assertions++;
        try { action.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected failure");
    }
    private static void reset() {
        type = "sdxECChangeAction"; policy = "sdxECR"; name = "CA-000123";
        renameFails = false; overwrite = false;
        context.transactionType = Context.TRANSACTION_TYPE_UPDATE;
        properties = new Properties();
        properties.setProperty("ecr.division.user.test-user", "MX");
        properties.setProperty("ecr.counter.W.20261021", "counter-W");
        BusinessObject.values.clear(); BusinessObject.calls.clear(); commands.clear();
        BusinessObject.values.put("counter-W", "1");
        BusinessObject.failWrite = false;
        MQLCommand.handler = (command, args) -> {
            commands.add(command);
            if (command.equals("print bus $1 select type dump")) return type;
            if (command.equals("print bus $1 select policy dump")) return policy;
            if (command.equals("print bus $1 select name dump")) return name;
            if (command.startsWith("temp query bus")) {
                // Existing highest name wins over a stale counter.
                return "sdxECChangeAction|ECR-W261021A999|A|ECR-W261021A999";
            }
            if (command.equals("modify bus $1 name $2")) {
                equal("object-1", args.get(0));
                if (renameFails) throw new Exception("rename access denied");
                name = overwrite ? "overwritten" : args.get(1);
                return "";
            }
            throw new AssertionError("Unexpected MQL: " + command);
        };
    }
    private static int run() throws Exception {
        return SdxEcrCreateAction.executeConfigured(context, new String[]{"object-1"},
                "sdxECChangeAction", properties, clock);
    }
    public static void main(String[] args) throws Exception {
        reset(); equal(0, run()); equal("ECR-W261021B001", name);
        equal("11000", BusinessObject.values.get("counter-W"));
        equal("lock:object-1", BusinessObject.calls.get(0));
        int commandCount = commands.size();
        equal(0, run()); equal("11000", BusinessObject.values.get("counter-W"));
        equal(commandCount + 3, commands.size()); // Only type, policy, name: no second allocation.

        reset(); policy = "sdxECO"; properties = null; equal(0, run());
        equal("CA-000123", name); equal("1", BusinessObject.values.get("counter-W"));
        reset(); type = "Change Action"; properties = null; equal(0, run());
        equal(1, commands.size());
        reset(); policy = "Change Action"; fails(() -> run());
        equal("1", BusinessObject.values.get("counter-W"));
        reset(); context.transactionType = 0; fails(() -> run()); equal(0, commands.size());
        reset(); context.transactionType = 1; fails(() -> run());
        reset(); fails(() -> SdxEcrCreateAction.executeConfigured(context,
                new String[]{"${OBJECTID}"}, type, properties, clock)); equal(0, commands.size());
        fails(() -> SdxEcrCreateAction.executeConfigured(context, new String[]{"id", "extra"},
                type, properties, clock));
        reset(); properties.remove("ecr.division.user.test-user"); fails(() -> run());
        equal("1", BusinessObject.values.get("counter-W"));
        reset(); properties.remove("ecr.counter.W.20261021"); fails(() -> run());
        reset(); BusinessObject.failWrite = true; fails(() -> run()); equal("CA-000123", name);
        reset(); renameFails = true; fails(() -> run()); equal("CA-000123", name);
        // Failure propagates; actual restoration of the counter needs an outer DB rollback.
        reset(); overwrite = true; fails(() -> run());
        reset(); name = "ECR-W261021A000"; fails(() -> run());
        equal("1", BusinessObject.values.get("counter-W"));
        reset(); name = "ECR-W2610320001"; fails(() -> run());
        reset(); name = "ECR-W2610200001"; equal(0, run()); // Preserve already numbered object.
        equal("1", BusinessObject.values.get("counter-W"));
        reset(); BusinessObject.values.put("counter-W", "35974"); fails(() -> run());
        equal("CA-000123", name);

        String previous = System.getProperty("sdx.ecr.mode");
        try {
            System.setProperty("sdx.ecr.mode", "adapter");
            fails(() -> SdxEcrCreateAction.execute(context, new String[]{"object-1"}));
            System.setProperty("sdx.ecr.mode", "trigger");
            CreateParameters cp = new CreateParameters().setType("sdxEcChangeAction").setName("untouched");
            SdxEcrNameHook.apply(context, cp); equal("untouched", cp.getName());
        } finally {
            if (previous == null) System.clearProperty("sdx.ecr.mode");
            else System.setProperty("sdx.ecr.mode", previous);
            MQLCommand.handler = null;
        }
        System.out.println("PASS: " + assertions + " create action assertions");
    }
}
