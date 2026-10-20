package com.sdx.enovia.ecr;

import com.dassault_systemes.createcontent.ErrorMngt.ENONewAppException;
import matrix.db.Context;
import matrix.db.CreateParameters;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Objects;
import java.util.Properties;

/** Insert at entry to the existing CA adapter's private createBusinessObject method. */
public final class SdxEcrNameHook {
    private SdxEcrNameHook() { }

    public static void apply(Context context, CreateParameters parameters) throws ENONewAppException {
        String targetType = System.getProperty("sdx.ecr.targetType", "sdxEcChangeAction");
        // Do not load configuration or touch counters for other types.
        if (!targetType.equals(parameters.getType())) return;
        try {
            Properties properties = new Properties();
            ClassLoader loader = SdxEcrNameHook.class.getClassLoader();
            try (InputStream input = loader.getResourceAsStream("sdx-ecr.properties")) {
                if (input == null) throw new IllegalStateException("Missing server resource: sdx-ecr.properties");
                properties.load(new InputStreamReader(input, StandardCharsets.UTF_8));
            }
            applyConfigured(context, parameters, targetType, properties, Clock.system(EcrNameService.BUSINESS_ZONE));
        } catch (Exception ex) {
            throw new ENONewAppException(ENONewAppException.ErrorCode.LEADING_APP_CREATE,
                    "ECR name allocation failed: " + ex.getMessage(), null, ex.getMessage());
        }
    }

    static void applyConfigured(Context context, CreateParameters parameters, String targetType,
                                Properties properties, Clock clock) throws Exception {
        if (!Objects.requireNonNull(targetType, "targetType").equals(parameters.getType())) return;
        // Exact server-side credential/user mapping; never trust options or guess organization.
        String role = context.getRole();
        String division = role == null ? null : properties.getProperty("ecr.division.role." + role);
        if (division == null) division = properties.getProperty("ecr.division.user." + context.getUser());
        if (division == null || division.trim().isEmpty()) {
            throw new IllegalStateException("No server-side division mapping for the current credential/user");
        }
        PropertiesCounterResolver resolver = new PropertiesCounterResolver(properties);
        String nextAttribute = properties.getProperty("ecr.nextNumberAttribute", "eService Next Number");
        EnoviaNumberGeneratorSequence sequence = new EnoviaNumberGeneratorSequence(context, resolver, nextAttribute);
        String name = new EcrNameService(clock).nextName(division, sequence);
        // Both are verified R2024x CreateParametersBase methods. Never rename a persisted object.
        parameters.setName(name);
    }
}
