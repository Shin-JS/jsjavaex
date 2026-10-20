package com.sdx.enovia.ecr;

import com.matrixone.apps.domain.DomainObject;
import matrix.db.Context;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

public final class EcrNumberingTest {
    private static int assertions;
    private static void equal(Object expected, Object actual) {
        assertions++;
        if (!expected.equals(actual)) throw new AssertionError(expected + " != " + actual);
    }
    private static void check(boolean ok) {
        assertions++;
        if (!ok) throw new AssertionError("condition failed");
    }
    private interface Work { void run() throws Exception; }
    private static void fails(Work work) throws Exception {
        assertions++;
        try { work.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected rejection");
    }
    public static void main(String[] args) throws Exception {
        equal("0001", EcrNumberRule.suffix(1));
        equal("9999", EcrNumberRule.suffix(9999));
        equal("A001", EcrNumberRule.suffix(10000));
        equal("A999", EcrNumberRule.suffix(10998));
        equal("B001", EcrNumberRule.suffix(10999));
        equal("Z001", EcrNumberRule.suffix(34975));
        equal("Z999", EcrNumberRule.suffix(35973));
        fails(() -> EcrNumberRule.suffix(0));
        fails(() -> EcrNumberRule.suffix(35974));
        for (String invalid : Arrays.asList("0000", "A000", "Z000", "a001", "AA01", "10000", "A01", " A001")) {
            fails(() -> EcrNumberRule.ordinal(invalid));
        }
        Set<String> all = new HashSet<>();
        for (int i = 1; i <= EcrNumberRule.MAX_ORDINAL; i++) {
            String suffix = EcrNumberRule.suffix(i);
            check(all.add(suffix));
            equal(i, EcrNumberRule.ordinal(suffix));
            check(suffix.matches("[0-9]{4}|[A-Z][0-9]{3}"));
            check(!suffix.matches("[A-Z]000"));
        }
        LocalDate day = LocalDate.of(2026, 10, 20);
        String[] divisions = {"MX", "NW", "VD", "DA", "HME"};
        String[] codes = {"W", "N", "V", "A", "H"};
        for (int i = 0; i < codes.length; i++) {
            String name = EcrNumberRule.name(divisions[i], day, 10000);
            equal("ECR-" + codes[i] + "261020A001", name);
            equal(15, name.length());
        }
        fails(() -> EcrNumberRule.name("OTHER", day, 1));
        fails(() -> EcrNumberRule.name("MX", LocalDate.of(2100, 1, 1), 1));
        Locale previous = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("ar-EG"));
            equal("ECR-W2610200001", EcrNumberRule.name(" mx ", day, 1));
        } finally { Locale.setDefault(previous); }

        Clock clock = Clock.fixed(Instant.parse("2026-10-19T15:00:00Z"), ZoneOffset.UTC);
        EcrNameService service = new EcrNameService(clock);
        equal("ECR-W261020A001", service.nextName("MX", (code, date, max) -> {
            equal("W", code); equal(day, date); equal(35973, max); return 10000;
        }));
        fails(() -> service.nextName("MX", (c,d,m) -> 35974));
        final int[] calls = {0};
        fails(() -> service.nextName("UNKNOWN", (c,d,m) -> { calls[0]++; return 1; }));
        equal(0, calls[0]);
        fails(() -> service.nextName("MX", (c,d,m) -> { throw new Exception("DB unavailable"); }));

        Properties properties = new Properties();
        properties.setProperty("ecr.counter.W.20261020", "test-W-day1");
        properties.setProperty("ecr.counter.N.20261020", "test-N-day1");
        properties.setProperty("ecr.counter.W.20261021", "test-W-day2");
        PropertiesCounterResolver resolver = new PropertiesCounterResolver(properties);
        Context context = new Context();
        EnoviaNumberGeneratorSequence sequence = new EnoviaNumberGeneratorSequence(context, resolver, "eService Next Number");
        DomainObject.values.put("test-W-day1", "9999");
        DomainObject.values.put("test-N-day1", "1");
        DomainObject.values.put("test-W-day2", "1");
        DomainObject.calls.clear();
        equal("ECR-W2610209999", service.nextName("MX", sequence));
        equal("10000", DomainObject.values.get("test-W-day1"));
        equal(Arrays.asList("lock:test-W-day1", "read:test-W-day1", "write:test-W-day1"), DomainObject.calls);
        equal("ECR-W261020A001", service.nextName("MX", sequence));
        equal("ECR-N2610200001", service.nextName("NW", sequence));
        EcrNameService tomorrow = new EcrNameService(Clock.offset(clock, java.time.Duration.ofDays(1)));
        equal("ECR-W2610210001", tomorrow.nextName("MX", sequence));
        DomainObject.values.put("test-W-day1", "35973");
        equal("ECR-W261020Z999", service.nextName("MX", sequence));
        equal("35974", DomainObject.values.get("test-W-day1"));
        fails(() -> service.nextName("MX", sequence));
        equal("35974", DomainObject.values.get("test-W-day1"));
        for (String bad : Arrays.asList("", "A001", "-1", "1.0", "0000", "999999999999")) {
            DomainObject.values.put("test-W-day1", bad);
            fails(() -> service.nextName("MX", sequence));
            equal(bad, DomainObject.values.get("test-W-day1"));
        }
        DomainObject.calls.clear();
        context.transactionType = 0;
        fails(() -> service.nextName("MX", sequence));
        equal(0, DomainObject.calls.size());
        context.transactionType = 1; // Read-only is also rejected.
        fails(() -> service.nextName("MX", sequence));
        context.transactionType = Context.TRANSACTION_TYPE_UPDATE;
        fails(() -> service.nextName("VD", sequence)); // No fallback to any shared counter.
        DomainObject.values.put("test-W-day1", "1");
        DomainObject.failWrite = true;
        fails(() -> service.nextName("MX", sequence));
        equal("1", DomainObject.values.get("test-W-day1"));
        DomainObject.failWrite = false;
        Properties duplicate = new Properties();
        duplicate.setProperty("ecr.counter.W.20261020", "same-id");
        duplicate.setProperty("ecr.counter.W.20261021", "same-id");
        fails(() -> new PropertiesCounterResolver(duplicate));
        Properties invalidDate = new Properties();
        invalidDate.setProperty("ecr.counter.W.20260230", "test-id");
        fails(() -> new PropertiesCounterResolver(invalidDate));
        fails(() -> new PropertiesCounterResolver(new Properties()));
        System.out.println("PASS: " + assertions + " assertions; all 35,973 suffixes checked");
        System.out.println("ENOVIA API tests use doubles; real DB locking/rollback is not verified.");
    }
}
