package com.sdx.enovia.ecr;

import matrix.db.BusinessObject;
import matrix.db.Context;
import matrix.db.CreateParameters;
import matrix.db.MQLCommand;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Properties;

/** Database output/call-order double tests, not live MQL execution tests. */
public class EcrExistingNumberQueryTest {
    private static int checks;
    private interface Work { void run() throws Exception; }
    private static void equal(Object expected, Object actual) {
        checks++;
        if (!expected.equals(actual)) throw new AssertionError(expected + " != " + actual);
    }
    private static void fails(Work work) throws Exception {
        checks++;
        try { work.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected failure");
    }
    private static String row(String suffix) {
        String name = "ECR-W261020" + suffix;
        return "sdxEcChangeAction|" + name + "|-|" + name + "\n";
    }

    public static void main(String[] args) throws Exception {
        final String prefix = "ECR-W261020";
        // Unsorted rows, repeated revisions, and alphabetic transitions.
        equal(10000, MqlExistingEcrNumbers.parseLastOrdinal(row("A001") + row("9999") + row("0001"), prefix));
        equal(10998, MqlExistingEcrNumbers.parseLastOrdinal(row("A999") + row("A001") + row("9999"), prefix));
        equal(35973, MqlExistingEcrNumbers.parseLastOrdinal(row("Z999") + row("0001") + row("A999"), prefix));
        equal(2, MqlExistingEcrNumbers.parseLastOrdinal(row("0002") + row("0002"), prefix));
        equal(0, MqlExistingEcrNumbers.parseLastOrdinal("\r\n", prefix));
        equal(1, MqlExistingEcrNumbers.parseLastOrdinal(row("0001").replace("\n", "\r\n"), prefix));
        String extra = "sdxEcChangeAction|ECR-W2610200001-extra|-|ECR-W2610200001-extra\n";
        equal(2, MqlExistingEcrNumbers.parseLastOrdinal(extra + row("0002"), prefix));
        for (String suffix : Arrays.asList("A000", "0000", "a001", "AA01", "Z000")) {
            fails(() -> MqlExistingEcrNumbers.parseLastOrdinal(row(suffix), prefix));
        }
        fails(() -> MqlExistingEcrNumbers.parseLastOrdinal(null, prefix));
        fails(() -> MqlExistingEcrNumbers.parseLastOrdinal("unexpected format", prefix));
        fails(() -> MqlExistingEcrNumbers.parseLastOrdinal("T|name|rev|different", prefix));
        fails(() -> MqlExistingEcrNumbers.parseLastOrdinal(row("0001").replace("W261020", "N261020"), prefix));

        Context context = new Context();
        LocalDate day = LocalDate.of(2026, 10, 20);
        Clock clock = Clock.fixed(Instant.parse("2026-10-20T00:00:00Z"), ZoneOffset.UTC);
        EcrNameService names = new EcrNameService(clock);
        Properties p = new Properties();
        p.setProperty("ecr.counter.W.20261020", "existing-counter");
        EnoviaNumberGeneratorSequence sequence = new EnoviaNumberGeneratorSequence(
                context, new PropertiesCounterResolver(p), "eService Next Number");

        BusinessObject.values.put("existing-counter", "1"); // Stale counter must catch up.
        BusinessObject.calls.clear();
        MQLCommand.result = row("0010") + row("0003");
        equal("ECR-W2610200011", names.nextName("MX", sequence));
        equal("12", BusinessObject.values.get("existing-counter"));
        equal(Arrays.asList("lock:existing-counter", "read:existing-counter", "query:ECR-W261020*", "write:existing-counter"), BusinessObject.calls);
        equal("temp query bus $1 $2 $3 vault $4 select name dump $5", MQLCommand.lastCommand);
        equal(Arrays.asList("*", "ECR-W261020*", "*", "*", "|"), MQLCommand.lastArguments);
        // Two allocations may occur before either newly created name is visible in a query.
        equal("ECR-W2610200012", names.nextName("MX", sequence));
        equal("13", BusinessObject.values.get("existing-counter"));

        BusinessObject.values.put("existing-counter", "1");
        MQLCommand.result = row("9999");
        equal("ECR-W261020A001", names.nextName("MX", sequence));
        equal("10001", BusinessObject.values.get("existing-counter"));
        BusinessObject.values.put("existing-counter", "1");
        MQLCommand.result = row("A999");
        equal("ECR-W261020B001", names.nextName("MX", sequence));
        equal("11000", BusinessObject.values.get("existing-counter"));

        BusinessObject.values.put("existing-counter", "20000"); // Keep high-water after deletions.
        MQLCommand.result = row("0001");
        equal(EcrNumberRule.name("MX", day, 20000), names.nextName("MX", sequence));
        equal("20001", BusinessObject.values.get("existing-counter"));
        for (String uninitialized : Arrays.asList("", "0", "0000")) {
            BusinessObject.values.put("existing-counter", uninitialized);
            MQLCommand.result = row("0007");
            equal("ECR-W2610200008", names.nextName("MX", sequence));
            equal("9", BusinessObject.values.get("existing-counter"));
        }
        BusinessObject.values.remove("existing-counter");
        MQLCommand.result = "";
        equal("ECR-W2610200001", names.nextName("MX", sequence));

        BusinessObject.values.put("existing-counter", "1");
        MQLCommand.result = row("Z999");
        fails(() -> names.nextName("MX", sequence));
        equal("1", BusinessObject.values.get("existing-counter"));
        MQLCommand.result = row("0001");
        MQLCommand.success = false;
        fails(() -> names.nextName("MX", sequence));
        equal("1", BusinessObject.values.get("existing-counter"));
        MQLCommand.success = true;
        MQLCommand.error = "insufficient access";
        fails(() -> names.nextName("MX", sequence));
        equal("1", BusinessObject.values.get("existing-counter"));
        MQLCommand.error = "";
        MQLCommand.result = row("A000");
        fails(() -> names.nextName("MX", sequence));
        equal("1", BusinessObject.values.get("existing-counter"));

        // Full production hook must use the query, not just the counter.
        p.setProperty("ecr.division.user.test-user", "MX");
        p.setProperty("ecr.query.typePattern", "sdxEcChangeAction");
        p.setProperty("ecr.query.vaultPattern", "eService Production");
        MQLCommand.result = row("A999");
        CreateParameters create = new CreateParameters().setType("sdxEcChangeAction").setName("old-name");
        SdxEcrNameHook.applyConfigured(context, create, "sdxEcChangeAction", p, clock);
        equal("ECR-W261020B001", create.getName());
        equal(Arrays.asList("sdxEcChangeAction", "ECR-W261020*", "*", "eService Production", "|"), MQLCommand.lastArguments);
        System.out.println("PASS: " + checks + " existing-number query/allocation checks");
    }
}
