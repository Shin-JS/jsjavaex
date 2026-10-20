package com.sdx.enovia.ecr;

import matrix.db.BusinessObject;
import matrix.db.Context;

import java.time.LocalDate;
import java.math.BigInteger;
import java.util.Objects;

/**
 * ENOVIA implementation using an EXISTING Number Generator business object.
 * No schema, generator, REST endpoint or business object is created here.
 * The enclosing existing create transaction owns commit/abort and releases locks.
 */
public final class EnoviaNumberGeneratorSequence implements EcrNameService.ExistingSequence {
    @FunctionalInterface
    public interface ExistingCounterResolver {
        /** Return the pre-existing counter dedicated to the exact division/day. */
        Counter resolve(String divisionCode, LocalDate day) throws Exception;
    }

    public static final class Counter {
        public final String objectId;
        public final String divisionCode;
        public final LocalDate day;

        public Counter(String objectId, String divisionCode, LocalDate day) {
            this.objectId = Objects.requireNonNull(objectId, "objectId").trim();
            if (this.objectId.isEmpty()) throw new IllegalArgumentException("Counter objectId is empty");
            this.divisionCode = EcrNumberRule.divisionCode(divisionCode);
            this.day = Objects.requireNonNull(day, "day");
        }
    }

    private final Context context;
    private final ExistingCounterResolver resolver;
    private final String nextNumberAttribute;
    private final MqlExistingEcrNumbers existingNumbers;

    public EnoviaNumberGeneratorSequence(Context context, ExistingCounterResolver resolver,
                                         String nextNumberAttribute) {
        this(context, resolver, nextNumberAttribute, new MqlExistingEcrNumbers("*", "*"));
    }

    public EnoviaNumberGeneratorSequence(Context context, ExistingCounterResolver resolver,
                                         String nextNumberAttribute, MqlExistingEcrNumbers existingNumbers) {
        this.context = Objects.requireNonNull(context, "context");
        this.resolver = Objects.requireNonNull(resolver, "resolver");
        this.nextNumberAttribute = Objects.requireNonNull(nextNumberAttribute, "nextNumberAttribute").trim();
        if (this.nextNumberAttribute.isEmpty()) throw new IllegalArgumentException("Missing next-number attribute");
        this.existingNumbers = Objects.requireNonNull(existingNumbers, "existingNumbers");
    }

    @Override
    public int reserve(String divisionCode, LocalDate day, int maximum) throws Exception {
        // Do not start or commit a nested transaction, or silently allocate outside one.
        if (context.getTransactionType() != Context.TRANSACTION_TYPE_UPDATE) {
            throw new IllegalStateException("ECR allocation requires the existing update transaction");
        }
        if (maximum != EcrNumberRule.MAX_ORDINAL) {
            throw new IllegalArgumentException("Unsupported ECR series limit");
        }
        Counter binding = Objects.requireNonNull(resolver.resolve(divisionCode, day), "counter binding");
        if (!binding.divisionCode.equals(divisionCode) || !binding.day.equals(day)) {
            throw new IllegalStateException("Counter binding does not match the requested ECR series");
        }
        BusinessObject counter = new BusinessObject(binding.objectId);
        // Transaction-level lock, not the persistent user lock/unlock API.
        counter.lockForUpdate(context);
        // A fresh read AFTER acquiring the lock is essential.
        String raw = counter.getAttributeValues(context, nextNumberAttribute).getValue();
        // Blank/zero means an uninitialized existing counter; seed it from real names below.
        if (raw == null || raw.isEmpty()) raw = "0";
        if (!raw.matches("[0-9]+")) {
            throw new IllegalStateException("Existing next-number value is not a supported positive integer");
        }
        BigInteger value = new BigInteger(raw);
        if (value.compareTo(BigInteger.valueOf(maximum)) > 0) {
            throw new IllegalStateException("ECR series exhausted or invalid; last supported suffix is Z999");
        }
        // Scan AFTER taking the shared series lock. Keep issued high-water if names were deleted.
        int lastExisting = existingNumbers.lastOrdinal(context, divisionCode, day);
        int next = Math.max(Math.max(1, value.intValue()), lastExisting + 1);
        if (next > maximum) {
            throw new IllegalStateException("Existing ECR series has reached Z999");
        }
        // Store the next ORDINAL, not the formatted alpha suffix.
        counter.setAttributeValue(context, nextNumberAttribute, Integer.toString(next + 1));
        return next;
    }
}
