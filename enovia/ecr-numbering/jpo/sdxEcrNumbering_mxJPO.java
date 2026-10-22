import matrix.db.Context;
import matrix.db.MQLCommand;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Immediate create action. All numbering logic lives in this JPO. */
public class sdxEcrNumbering_mxJPO {
    private static final String TARGET_TYPE = "sdxECChangeAction";
    private static final int MAX_ORDINAL = 9999 + 26 * 999;
    private static final int MAX_ATTEMPTS = 100;
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Seoul");

    public sdxEcrNumbering_mxJPO(Context context, String[] args) { }

    public int createAction(Context context, String[] args) throws Exception {
        requireUpdate(context);
        if (args == null || args.length != 1 || args[0] == null
                || args[0].trim().isEmpty() || args[0].contains("${")) {
            throw new IllegalArgumentException("Pass one resolved ${OBJECTID} argument");
        }
        String id = args[0].trim();
        if (!TARGET_TYPE.equals(select(context, id, "type"))) return 0;
        String policy = select(context, id, "policy");
        if ("sdxECO".equals(policy)) return 0;
        if (!"sdxECR".equals(policy)) {
            throw new IllegalStateException("Expected sdxECR policy; actual: " + policy);
        }
        String originalName = select(context, id, "name");
        if (isNumbered(originalName)) return 0;
        if (originalName.startsWith("ECR-")) {
            throw new IllegalStateException("Malformed ECR name: " + originalName);
        }
        String revision = select(context, id, "revision");
        String division = resolveDivision(context);
        // Capture once; retries across midnight stay in the same daily series.
        LocalDate day = LocalDate.now(BUSINESS_ZONE);
        String prefix = "ECR-" + divisionCode(division)
                + day.format(DateTimeFormatter.ofPattern("yyMMdd", Locale.ROOT));
        int next = lastOrdinal(context, prefix) + 1;
        Exception lastConflict = null;
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            if (next > MAX_ORDINAL) {
                throw new IllegalStateException("ECR sequence exhausted: " + prefix, lastConflict);
            }
            String candidate = prefix + suffix(next);
            try {
                mql(context, "modify bus $1 name $2", id, candidate);
            } catch (Exception renameFailure) {
                // Never continue a transaction that the kernel has aborted.
                // Do not classify localized error messages by substring matching.
                try {
                    requireUpdate(context);
                    if (!originalName.equals(select(context, id, "name"))
                            || !occupiedByOther(context, candidate, revision, id)) {
                        throw renameFailure;
                    }
                } catch (Exception verificationFailure) {
                    if (verificationFailure != renameFailure) {
                        renameFailure.addSuppressed(verificationFailure);
                    }
                    throw renameFailure;
                }
                lastConflict = renameFailure;
                next = Math.max(next + 1, lastOrdinal(context, prefix) + 1);
                continue;
            }
            // Keep verification outside the catch: a changename trigger changing
            // the name is an error, not a duplicate-number retry.
            if (!candidate.equals(select(context, id, "name"))) {
                throw new IllegalStateException("ECR name changed during rename: " + candidate);
            }
            return 0;
        }
        throw new IllegalStateException("ECR rename conflict retry limit exceeded", lastConflict);
    }

    /** Fill exact SERVER credential/user mappings before deployment.
     * If department lookup is required, replace this method with the verified
     * server-side lookup. Never trust a widget-supplied division parameter.
     */
    protected String resolveDivision(Context context) {
        Map<String, String> roles = new HashMap<String, String>();
        Map<String, String> users = new HashMap<String, String>();
        // roles.put("ctx::VPLMProjectLeader.REAL_ORGANIZATION.REAL_SPACE", "MX");
        // users.put("REAL_LOGIN_NAME", "MX");
        String division = roles.get(context.getRole());
        if (division == null) division = users.get(context.getUser());
        if (division == null) {
            throw new IllegalStateException("Configure resolveDivision for the current server user/credential");
        }
        return division;
    }

    private static void requireUpdate(Context context) throws Exception {
        if (context.getTransactionType() != Context.TRANSACTION_TYPE_UPDATE) {
            throw new IllegalStateException("Requires the caller's active update transaction");
        }
    }

    private static String mql(Context context, String command, String... args) throws Exception {
        String result = MQLCommand.exec(context, command, Arrays.asList(args));
        if (result == null) throw new IllegalStateException("Missing MQL result buffer");
        return result;
    }

    private static String select(Context context, String id, String field) throws Exception {
        // field is always a literal from this class, never external input.
        String value = mql(context, "print bus $1 select " + field + " dump", id).trim();
        // An empty revision is valid; other fields must be present.
        if (value.isEmpty() && !"revision".equals(field)) {
            throw new IllegalStateException("Missing object " + field);
        }
        return value;
    }

    private static int lastOrdinal(Context context, String prefix) throws Exception {
        String result = mql(context,
                "temp query bus $1 $2 $3 vault $4 select name dump $5",
                "*", prefix + "*", "*", "*", "|");
        int last = 0;
        for (String row : result.split("\\r?\\n")) {
            if (row.trim().isEmpty()) continue;
            String[] fields = row.split("\\|", -1);
            if (fields.length != 4 || !fields[1].equals(fields[3])
                    || !fields[3].startsWith(prefix)) {
                throw new IllegalStateException("Unexpected existing-number query row");
            }
            String name = fields[3];
            if (name.length() != 15) continue;
            last = Math.max(last, ordinal(name.substring(11)));
        }
        return last;
    }

    private static boolean occupiedByOther(Context context, String name,
                                            String revision, String ownId) throws Exception {
        String result = mql(context,
                "temp query bus $1 $2 $3 vault $4 select id dump $5",
                TARGET_TYPE, name, revision, "*", "|");
        boolean found = false;
        for (String row : result.split("\\r?\\n")) {
            if (row.trim().isEmpty()) continue;
            String[] fields = row.split("\\|", -1);
            if (fields.length != 4 || !TARGET_TYPE.equals(fields[0])
                    || !name.equals(fields[1]) || !revision.equals(fields[2])
                    || fields[3].trim().isEmpty()) {
                throw new IllegalStateException("Unexpected conflict query row");
            }
            if (!ownId.equals(fields[3])) found = true;
        }
        return found;
    }

    static String divisionCode(String division) {
        switch (division.trim().toUpperCase(Locale.ROOT)) {
            case "MX": case "W": return "W";
            case "NW": case "N": return "N";
            case "VD": case "V": return "V";
            case "DA": case "A": return "A";
            case "HME": case "H": return "H";
            default: throw new IllegalArgumentException("Unknown division: " + division);
        }
    }

    static String suffix(int ordinal) {
        if (ordinal < 1 || ordinal > MAX_ORDINAL) {
            throw new IllegalArgumentException("ECR sequence must be 1.." + MAX_ORDINAL);
        }
        if (ordinal <= 9999) return String.format(Locale.ROOT, "%04d", ordinal);
        int offset = ordinal - 10000;
        return (char) ('A' + offset / 999)
                + String.format(Locale.ROOT, "%03d", offset % 999 + 1);
    }

    static int ordinal(String suffix) {
        if (suffix.matches("[0-9]{4}")) {
            int value = Integer.parseInt(suffix);
            if (value >= 1) return value;
        } else if (suffix.matches("[A-Z][0-9]{3}")) {
            int value = Integer.parseInt(suffix.substring(1));
            if (value >= 1) return 10000 + (suffix.charAt(0) - 'A') * 999 + value - 1;
        }
        throw new IllegalArgumentException("Invalid ECR suffix: " + suffix);
    }

    private static boolean isNumbered(String name) {
        if (!name.matches("ECR-[WNVAH][0-9]{6}([0-9]{4}|[A-Z][0-9]{3})")) return false;
        try {
            LocalDate.parse("20" + name.substring(5, 11),
                    DateTimeFormatter.ofPattern("uuuuMMdd", Locale.ROOT)
                            .withResolverStyle(ResolverStyle.STRICT));
            ordinal(name.substring(11));
            return true;
        } catch (IllegalArgumentException | java.time.DateTimeException ex) {
            return false;
        }
    }
}
