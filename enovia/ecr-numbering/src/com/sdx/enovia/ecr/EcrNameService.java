package com.sdx.enovia.ecr;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Objects;

/** Call inside the existing create operation, at its final name allocation point. */
public final class EcrNameService {
    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Seoul");

    @FunctionalInterface
    public interface ExistingSequence {
        /**
         * Atomically reserve a persistent, 1-based ordinal for this division/day.
         * Enforce maximum before mutation; never reset a shared live counter.
         * Callers supply their existing DB/JPO implementation, not an in-memory counter.
         */
        int reserve(String divisionCode, LocalDate day, int maximum) throws Exception;
    }

    private final Clock clock;

    public EcrNameService() {
        this(Clock.system(BUSINESS_ZONE));
    }

    public EcrNameService(Clock clock) {
        this.clock = Objects.requireNonNull(clock, "clock").withZone(BUSINESS_ZONE);
    }

    public String nextName(String division, ExistingSequence sequence) throws Exception {
        String code = EcrNumberRule.divisionCode(division);
        LocalDate day = LocalDate.now(clock); // Capture once, even across midnight.
        EcrNumberRule.name(code, day, 1); // Validate before consuming an ordinal.
        int ordinal = Objects.requireNonNull(sequence, "sequence")
                .reserve(code, day, EcrNumberRule.MAX_ORDINAL);
        return EcrNumberRule.name(code, day, ordinal);
    }
}
