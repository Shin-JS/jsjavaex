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

/** Immediate create action; args contains only the new object's OBJECTID. */
public class sdxEcrNumbering_mxJPO {
    public sdxEcrNumbering_mxJPO(Context context, String[] args) { }

    public int createAction(Context context, String[] args) throws Exception {
        final String targetType = "sdxECChangeAction";
        final int maxOrdinal = 9999 + 26 * 999;
        final int maxAttempts = 100;

        if (context.getTransactionType() != Context.TRANSACTION_TYPE_UPDATE) {
            throw new IllegalStateException("Requires the caller's active update transaction");
        }
        if (args == null || args.length != 1 || args[0] == null
                || args[0].trim().isEmpty() || args[0].contains("${")) {
            throw new IllegalArgumentException("Pass one resolved ${OBJECTID} argument");
        }
        String objectId = args[0].trim();

        // Read separately to preserve empty revisions and avoid delimiter ambiguity.
        String type = MQLCommand.exec(context, "print bus $1 select type dump", Arrays.asList(objectId));
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalStateException("Missing object type");
        }
        if (!targetType.equals(type.trim())) return 0;
        // User attributes are saved after this create action in this flow.
        // Determine ECR from its creation policy, not the later sdxECType value.
        String policy = MQLCommand.exec(context, "print bus $1 select policy dump", Arrays.asList(objectId));
        if (policy == null || policy.trim().isEmpty()) {
            throw new IllegalStateException("Missing object policy");
        }
        policy = policy.trim();
        if ("sdxECO".equals(policy)) return 0;
        if (!"sdxECR".equals(policy)) {
            throw new IllegalStateException("Expected sdxECR policy; actual: " + policy);
        }
        String originalName = MQLCommand.exec(context, "print bus $1 select name dump", Arrays.asList(objectId));
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new IllegalStateException("Missing object name");
        }
        originalName = originalName.trim();
        boolean numbered = false;
        if (originalName.matches("ECR-[WNVAH][0-9]{6}([0-9]{4}|[A-Z][0-9]{3})")) {
            try {
                LocalDate.parse("20" + originalName.substring(5, 11),
                        DateTimeFormatter.ofPattern("uuuuMMdd", Locale.ROOT)
                                .withResolverStyle(ResolverStyle.STRICT));
                String tail = originalName.substring(11);
                numbered = Integer.parseInt(Character.isDigit(tail.charAt(0))
                        ? tail : tail.substring(1)) >= 1;
            } catch (IllegalArgumentException | java.time.DateTimeException invalidName) {
                numbered = false;
            }
        }
        if (numbered) return 0;
        if (originalName.startsWith("ECR-")) {
            throw new IllegalStateException("Malformed ECR name: " + originalName);
        }
        String revision = MQLCommand.exec(context, "print bus $1 select revision dump", Arrays.asList(objectId));
        if (revision == null) throw new IllegalStateException("Missing revision result buffer");
        revision = revision.trim(); // An empty revision is valid.

        // Configure exact SERVER credential/login mappings here before deployment.
        // A verified department lookup, when available, also belongs in this block.
        Map<String, String> roles = new HashMap<String, String>();
        Map<String, String> users = new HashMap<String, String>();
        // roles.put("ctx::VPLMProjectLeader.REAL_ORGANIZATION.REAL_SPACE", "MX");
        // users.put("REAL_LOGIN_NAME", "MX");
        String division = roles.get(context.getRole());
        if (division == null) division = users.get(context.getUser());
        if (division == null) {
            throw new IllegalStateException("Configure the server user/credential division mapping in createAction");
        }
        String divisionCode;
        switch (division.trim().toUpperCase(Locale.ROOT)) {
            case "MX": case "W": divisionCode = "W"; break;
            case "NW": case "N": divisionCode = "N"; break;
            case "VD": case "V": divisionCode = "V"; break;
            case "DA": case "A": divisionCode = "A"; break;
            case "HME": case "H": divisionCode = "H"; break;
            default: throw new IllegalArgumentException("Unknown division: " + division);
        }
        // Capture once; retries across midnight stay in the same daily series.
        LocalDate day = LocalDate.now(ZoneId.of("Asia/Seoul"));
        String prefix = "ECR-" + divisionCode
                + day.format(DateTimeFormatter.ofPattern("yyMMdd", Locale.ROOT));
        int next = 1;
        Exception lastConflict = null;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            String result = MQLCommand.exec(context,
                    "temp query bus $1 $2 $3 vault $4 select name dump $5",
                    Arrays.asList("*", prefix + "*", "*", "*", "|"));
            if (result == null) throw new IllegalStateException("Missing existing-number query buffer");
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
                String tail = name.substring(11);
                int ordinal;
                if (tail.matches("[0-9]{4}") && Integer.parseInt(tail) >= 1) {
                    ordinal = Integer.parseInt(tail);
                } else if (tail.matches("[A-Z][0-9]{3}")
                        && Integer.parseInt(tail.substring(1)) >= 1) {
                    ordinal = 10000 + (tail.charAt(0) - 'A') * 999
                            + Integer.parseInt(tail.substring(1)) - 1;
                } else {
                    throw new IllegalArgumentException("Invalid ECR suffix: " + tail);
                }
                last = Math.max(last, ordinal);
            }
            next = Math.max(next, last + 1);
            if (next > maxOrdinal) {
                throw new IllegalStateException("ECR sequence exhausted: " + prefix, lastConflict);
            }
            String suffix;
            if (next <= 9999) {
                suffix = String.format(Locale.ROOT, "%04d", next);
            } else {
                int offset = next - 10000;
                suffix = (char) ('A' + offset / 999)
                        + String.format(Locale.ROOT, "%03d", offset % 999 + 1);
            }
            String candidate = prefix + suffix;
            try {
                String renamed = MQLCommand.exec(context, "modify bus $1 name $2",
                        Arrays.asList(objectId, candidate));
                if (renamed == null) throw new IllegalStateException("Missing rename result buffer");
            } catch (Exception renameFailure) {
                // Retry only if the outer transaction survived, our name is
                // unchanged, and another object occupies this exact T/N/R.
                // Do not classify localized error text by substring matching.
                try {
                    if (context.getTransactionType() != Context.TRANSACTION_TYPE_UPDATE) {
                        throw new IllegalStateException("Rename ended the update transaction");
                    }
                    String actualName = MQLCommand.exec(context,
                            "print bus $1 select name dump", Arrays.asList(objectId));
                    if (actualName == null || !originalName.equals(actualName.trim())) {
                        throw renameFailure;
                    }
                    String conflicts = MQLCommand.exec(context,
                            "temp query bus $1 $2 $3 vault $4 select id dump $5",
                            Arrays.asList(targetType, candidate, revision, "*", "|"));
                    if (conflicts == null) throw new IllegalStateException("Missing conflict query buffer");
                    boolean occupied = false;
                    for (String row : conflicts.split("\\r?\\n")) {
                        if (row.trim().isEmpty()) continue;
                        String[] fields = row.split("\\|", -1);
                        if (fields.length != 4 || !targetType.equals(fields[0])
                                || !candidate.equals(fields[1]) || !revision.equals(fields[2])
                                || fields[3].trim().isEmpty()) {
                            throw new IllegalStateException("Unexpected conflict query row");
                        }
                        if (!objectId.equals(fields[3])) occupied = true;
                    }
                    if (!occupied) throw renameFailure;
                } catch (Exception verificationFailure) {
                    if (verificationFailure != renameFailure) {
                        renameFailure.addSuppressed(verificationFailure);
                    }
                    throw renameFailure;
                }
                lastConflict = renameFailure;
                next++;
                continue;
            }
            // Verification remains outside the retry catch.
            String actualName = MQLCommand.exec(context,
                    "print bus $1 select name dump", Arrays.asList(objectId));
            if (actualName == null || !candidate.equals(actualName.trim())) {
                throw new IllegalStateException("ECR name changed during rename: " + candidate);
            }
            return 0;
        }
        throw new IllegalStateException("ECR rename conflict retry limit exceeded", lastConflict);
    }
}
