package com.sdx.enovia.ecr;

import matrix.db.BusinessObject;
import matrix.db.Context;
import matrix.db.MQLCommand;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Arrays;
import java.util.Properties;

/** Immediate Create Action only. The outer create transaction owns commit/abort. */
public final class SdxEcrCreateAction {
    private SdxEcrCreateAction() { }

    public static int execute(Context context, String[] args) throws Exception {
        if (!"trigger".equals(System.getProperty("sdx.ecr.mode", "adapter"))) {
            throw new IllegalStateException("Create Action requires -Dsdx.ecr.mode=trigger");
        }
        return executeConfigured(context, args,
                System.getProperty("sdx.ecr.targetType", "sdxECChangeAction"), null,
                Clock.system(EcrNameService.BUSINESS_ZONE));
    }

    static int executeConfigured(Context context, String[] args, String targetType,
                                 Properties properties, Clock clock) throws Exception {
        if (context.getTransactionType() != Context.TRANSACTION_TYPE_UPDATE) {
            throw new IllegalStateException("Immediate Create Action requires the outer update transaction");
        }
        if (args == null || args.length != 1 || args[0] == null || args[0].trim().isEmpty()
                || args[0].contains("${")) {
            throw new IllegalArgumentException("Pass exactly one resolved ${OBJECTID} argument");
        }
        String id = args[0].trim();
        // Re-read after locking: repeated invocation in the same transaction must not allocate twice.
        new BusinessObject(id).lockForUpdate(context);
        if (!targetType.equals(select(context, id, "type"))) return 0;
        String policy = select(context, id, "policy");
        if ("sdxECO".equals(policy)) return 0;
        if (!"sdxECR".equals(policy)) {
            throw new IllegalStateException("ECR creation policy must be sdxECR; actual policy: " + policy);
        }
        String currentName = select(context, id, "name");
        if (isNumbered(currentName)) return 0;
        if (currentName.startsWith("ECR-")) {
            throw new IllegalStateException("Malformed existing ECR name: " + currentName);
        }
        String name = EcrServerConfiguration.nextName(context,
                properties == null ? EcrServerConfiguration.load() : properties, clock);
        MQLCommand.exec(context, "modify bus $1 name $2", Arrays.asList(id, name));
        // Detect rename rejection/overwrite during changename triggers. Never swallow an error.
        if (!name.equals(select(context, id, "name"))) {
            throw new IllegalStateException("ECR name was not retained after rename");
        }
        return 0;
    }

    private static String select(Context context, String id, String field) throws Exception {
        String value = MQLCommand.exec(context, "print bus $1 select " + field + " dump",
                Arrays.asList(id));
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("Missing business object " + field);
        }
        return value.trim();
    }

    private static boolean isNumbered(String name) {
        if (!name.matches("ECR-[WNVAH][0-9]{6}([0-9]{4}|[A-Z][0-9]{3})")) return false;
        try {
            LocalDate.parse("20" + name.substring(5, 11),
                    DateTimeFormatter.ofPattern("uuuuMMdd").withResolverStyle(ResolverStyle.STRICT));
            EcrNumberRule.ordinal(name.substring(11));
            return true;
        } catch (IllegalArgumentException | java.time.DateTimeException ex) {
            return false;
        }
    }
}
