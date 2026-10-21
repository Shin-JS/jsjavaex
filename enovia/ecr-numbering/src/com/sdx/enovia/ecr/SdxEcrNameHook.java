package com.sdx.enovia.ecr;

import com.dassault_systemes.createcontent.ErrorMngt.ENONewAppException;
import matrix.db.Context;
import matrix.db.CreateParameters;

import java.time.Clock;
import java.util.Objects;
import java.util.Properties;

/** Insert at entry to the existing CA adapter's private createBusinessObject method. */
public final class SdxEcrNameHook {
    private SdxEcrNameHook() { }

    public static void apply(Context context, CreateParameters parameters) throws ENONewAppException {
        // Migration guard: a still-deployed adapter call must not allocate a second number.
        if ("trigger".equals(System.getProperty("sdx.ecr.mode", "adapter"))) return;
        String targetType = System.getProperty("sdx.ecr.targetType", "sdxEcChangeAction");
        // Do not load configuration or touch counters for other types.
        if (!targetType.equals(parameters.getType())) return;
        try {
            Properties properties = EcrServerConfiguration.load();
            applyConfigured(context, parameters, targetType, properties, Clock.system(EcrNameService.BUSINESS_ZONE));
        } catch (Exception ex) {
            throw new ENONewAppException(ENONewAppException.ErrorCode.LEADING_APP_CREATE,
                    "ECR name allocation failed: " + ex.getMessage(), null, ex.getMessage());
        }
    }

    static void applyConfigured(Context context, CreateParameters parameters, String targetType,
                                Properties properties, Clock clock) throws Exception {
        if (!Objects.requireNonNull(targetType, "targetType").equals(parameters.getType())) return;
        String name = EcrServerConfiguration.nextName(context, properties, clock);
        // Both are verified R2024x CreateParametersBase methods. Never rename a persisted object.
        parameters.setName(name);
    }
}
