package com.sdx.enovia.ecr;

import matrix.db.Context;
import matrix.db.MQLCommand;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Objects;

/** Query committed/current-transaction business-object names, without a search index. */
public final class MqlExistingEcrNumbers {
    private static final String COMMAND = "temp query bus $1 $2 $3 vault $4 select name dump $5";
    private final String typePattern;
    private final String vaultPattern;

    public MqlExistingEcrNumbers(String typePattern, String vaultPattern) {
        this.typePattern = nonBlank(typePattern, "typePattern");
        this.vaultPattern = nonBlank(vaultPattern, "vaultPattern");
    }

    private static String nonBlank(String value, String label) {
        String text = Objects.requireNonNull(value, label).trim();
        if (text.isEmpty()) throw new IllegalArgumentException("Missing " + label);
        return text;
    }

    public int lastOrdinal(Context context, String divisionCode, LocalDate day) throws Exception {
        String prefix = EcrNumberRule.name(divisionCode, day, 1).substring(0, 11);
        // R2024x exec binds values and propagates MatrixException on query failure.
        // Do not turn query failures into an empty series / 0001.
        String result = MQLCommand.exec(context, COMMAND,
                Arrays.asList(typePattern, prefix + "*", "*", vaultPattern, "|"));
        return parseLastOrdinal(result, prefix);
    }

    static int parseLastOrdinal(String result, String prefix) {
        if (result == null) throw new IllegalStateException("Existing ECR query returned no result buffer");
        int last = 0;
        for (String row : result.split("\\r?\\n", -1)) {
            if (row.trim().isEmpty()) continue;
            // temp query bus + select name + dump: type|name|revision|name.
            String[] fields = row.split("\\|", -1);
            if (fields.length != 4 || !fields[1].equals(fields[3])) {
                throw new IllegalStateException("Unexpected existing ECR query row format");
            }
            String name = fields[3];
            if (!name.startsWith(prefix)) {
                throw new IllegalStateException("Existing ECR query returned a different series");
            }
            // Longer/shorter names are outside this fixed-width numbering rule.
            if (name.length() != 15) continue;
            final int ordinal;
            try {
                ordinal = EcrNumberRule.ordinal(name.substring(11));
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("Invalid existing ECR suffix: " + name, ex);
            }
            last = Math.max(last, ordinal);
        }
        return last;
    }
}
