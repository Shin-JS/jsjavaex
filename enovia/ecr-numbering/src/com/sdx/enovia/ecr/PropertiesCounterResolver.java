package com.sdx.enovia.ecr;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.Set;

/** Explicit bindings to existing counters; never guesses or creates a generator. */
public final class PropertiesCounterResolver implements EnoviaNumberGeneratorSequence.ExistingCounterResolver {
    private static final String PREFIX = "ecr.counter.";
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("uuuuMMdd")
            .withResolverStyle(ResolverStyle.STRICT);
    private final Map<String, EnoviaNumberGeneratorSequence.Counter> bindings;

    public PropertiesCounterResolver(Properties properties) {
        Objects.requireNonNull(properties, "properties");
        Map<String, EnoviaNumberGeneratorSequence.Counter> map = new HashMap<>();
        Set<String> objectIds = new HashSet<>();
        for (String key : properties.stringPropertyNames()) {
            if (!key.startsWith(PREFIX)) continue;
            String[] parts = key.substring(PREFIX.length()).split("\\.", -1);
            if (parts.length != 2 || !parts[0].matches("[WNVAH]") || !parts[1].matches("[0-9]{8}")) {
                throw new IllegalArgumentException("Invalid counter binding key: " + key);
            }
            LocalDate day = LocalDate.parse(parts[1], DAY);
            String objectId = properties.getProperty(key).trim();
            if (!objectIds.add(objectId)) {
                throw new IllegalArgumentException("A counter cannot be shared across division/date bindings");
            }
            map.put(parts[0] + "." + parts[1], new EnoviaNumberGeneratorSequence.Counter(objectId, parts[0], day));
        }
        if (map.isEmpty()) throw new IllegalArgumentException("No existing ECR counters configured");
        bindings = Collections.unmodifiableMap(map);
    }

    @Override
    public EnoviaNumberGeneratorSequence.Counter resolve(String divisionCode, LocalDate day) {
        String key = divisionCode + "." + day.format(DAY);
        EnoviaNumberGeneratorSequence.Counter counter = bindings.get(key);
        if (counter == null) throw new IllegalStateException("Missing existing counter binding: " + PREFIX + key);
        return counter;
    }
}
