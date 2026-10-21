package com.sdx.enovia.ecr;

import matrix.db.Context;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Properties;

/** Shared server-side configuration for the adapter and create trigger. */
final class EcrServerConfiguration {
    private EcrServerConfiguration() { }

    static Properties load() throws Exception {
        Properties properties = new Properties();
        try (InputStream input = EcrServerConfiguration.class.getClassLoader()
                .getResourceAsStream("sdx-ecr.properties")) {
            if (input == null) throw new IllegalStateException("Missing server resource: sdx-ecr.properties");
            properties.load(new InputStreamReader(input, StandardCharsets.UTF_8));
        }
        return properties;
    }

    static String nextName(Context context, Properties properties, Clock clock) throws Exception {
        String role = context.getRole();
        String division = role == null ? null : properties.getProperty("ecr.division.role." + role);
        if (division == null) division = properties.getProperty("ecr.division.user." + context.getUser());
        if (division == null || division.trim().isEmpty()) {
            throw new IllegalStateException("No server-side division mapping for the current credential/user");
        }
        EnoviaNumberGeneratorSequence sequence = new EnoviaNumberGeneratorSequence(context,
                new PropertiesCounterResolver(properties),
                properties.getProperty("ecr.nextNumberAttribute", "eService Next Number"),
                new MqlExistingEcrNumbers(properties.getProperty("ecr.query.typePattern", "*"),
                        properties.getProperty("ecr.query.vaultPattern", "*")));
        return new EcrNameService(clock).nextName(division, sequence);
    }
}
