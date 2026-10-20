package com.sdx.enovia.ecr;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Objects;

/** Formatting only: the existing persistent allocator must issue the ordinal. */
public final class EcrNumberRule {
    public static final int MAX_ORDINAL = 9999 + 26 * 999; // 35973 = Z999
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyMMdd", Locale.ROOT);

    private EcrNumberRule() { }

    public static String divisionCode(String division) {
        String value = Objects.requireNonNull(division, "division").trim().toUpperCase(Locale.ROOT);
        switch (value) {
            case "MX": case "W": return "W";
            case "NW": case "N": return "N";
            case "VD": case "V": return "V";
            case "DA": case "A": return "A";
            case "HME": case "H": return "H";
            default: throw new IllegalArgumentException("Unknown ECR division: " + value);
        }
    }

    public static String suffix(int ordinal) {
        if (ordinal < 1 || ordinal > MAX_ORDINAL) {
            throw new IllegalArgumentException("ECR ordinal must be 1.." + MAX_ORDINAL);
        }
        if (ordinal <= 9999) {
            return String.format(Locale.ROOT, "%04d", ordinal);
        }
        int offset = ordinal - 10000;
        char letter = (char) ('A' + offset / 999);
        return letter + String.format(Locale.ROOT, "%03d", offset % 999 + 1);
    }

    /** Useful when migrating the last issued suffix; not a concurrent allocator. */
    public static int ordinal(String suffix) {
        Objects.requireNonNull(suffix, "suffix");
        if (suffix.matches("[0-9]{4}")) {
            int value = Integer.parseInt(suffix);
            if (value >= 1) return value;
        } else if (suffix.matches("[A-Z][0-9]{3}")) {
            int tail = Integer.parseInt(suffix.substring(1));
            if (tail >= 1) return 10000 + (suffix.charAt(0) - 'A') * 999 + tail - 1;
        }
        throw new IllegalArgumentException("Invalid ECR suffix: " + suffix);
    }

    public static String name(String division, LocalDate day, int ordinal) {
        Objects.requireNonNull(day, "day");
        // yyMMdd repeats each century; keep this deployment within one century.
        if (day.getYear() < 2000 || day.getYear() > 2099) {
            throw new IllegalArgumentException("ECR date must be within 2000..2099");
        }
        return "ECR-" + divisionCode(division) + day.format(DATE) + suffix(ordinal);
    }
}
