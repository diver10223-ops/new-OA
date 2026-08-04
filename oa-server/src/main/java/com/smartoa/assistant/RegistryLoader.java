package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

@Component
public class RegistryLoader {
    private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    private final ObjectMapper json = new ObjectMapper();
    private final Map<String, Object> registries = new HashMap<>();
    private final Path configDirectory;

    public RegistryLoader() {
        this(Path.of("assistant-config"));
    }

    RegistryLoader(Path configDirectory) {
        this.configDirectory = configDirectory;
    }

    @PostConstruct
    public void load() throws IOException {
        registries.clear();
        if (!Files.isDirectory(configDirectory)) {
            return;
        }
        try (Stream<Path> paths = Files.list(configDirectory)) {
            for (Path path : paths.sorted().toList()) {
                String name = path.getFileName().toString();
                try {
                    if (name.endsWith(".yml") || name.endsWith(".yaml")) {
                        registries.put(name, yaml.readValue(path.toFile(), Object.class));
                    } else if (name.endsWith(".json")) {
                        registries.put(name, json.readValue(path.toFile(), Object.class));
                    }
                } catch (Exception e) {
                    throw new IllegalStateException("config file error [" + name + "]: " + e.getMessage(), e);
                }
            }
        }
        validateReferences();
    }

    private void validateReferences() {
        Set<String> intents = ids("intents.yml", "intents", "intent");
        Set<String> skills = ids("skills.yml", "skills", "skill");
        Set<String> templates = ids("templates.yml", "templates", "template");
        Set<String> policies = ids("policies.yml", "policies", "policy");
        ids("scenarios.yml", "scenarios", "scenario");

        for (Map<String, Object> scenario : entries("scenarios.yml", "scenarios", "scenario")) {
            String scenarioId = requiredId(scenario, "scenario");
            requireReference("intent", scenario.get("intent"), intents, scenarioId);
            requireReference("template", scenario.get("template"), templates, scenarioId);
            for (Object skill : list(scenario, "skills", scenarioId)) {
                requireReference("skill", skill, skills, scenarioId);
            }
            for (Object policy : list(scenario, "policies", scenarioId)) {
                requireReference("policy", policy, policies, scenarioId);
            }
        }
    }

    private Set<String> ids(String file, String key, String type) {
        Set<String> ids = new HashSet<>();
        for (Map<String, Object> entry : entries(file, key, type)) {
            String id = requiredId(entry, type);
            if (!ids.add(id)) {
                throw new IllegalStateException("duplicate " + type + " id [" + id + "]");
            }
        }
        return ids;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> entries(String file, String key, String type) {
        Object registry = registries.get(file);
        if (!(registry instanceof Map<?, ?> root) || !(root.get(key) instanceof List<?> values)) {
            throw new IllegalStateException("missing " + type + " registry id [" + key + "] in " + file);
        }
        return (List<Map<String, Object>>) (List<?>) values;
    }

    private String requiredId(Map<String, Object> entry, String type) {
        Object id = entry.get("id");
        if (!(id instanceof String value) || value.isBlank()) {
            throw new IllegalStateException("missing " + type + " id [null]");
        }
        return value;
    }

    private List<?> list(Map<String, Object> scenario, String key, String scenarioId) {
        if (!(scenario.get(key) instanceof List<?> values)) {
            throw new IllegalStateException("missing scenario " + key + " id [" + scenarioId + "]");
        }
        return values;
    }

    private void requireReference(String type, Object reference, Set<String> knownIds, String scenarioId) {
        String id = String.valueOf(reference);
        if (!(reference instanceof String) || !knownIds.contains(id)) {
            throw new IllegalStateException("missing " + type + " reference id [" + id
                    + "] in scenario [" + scenarioId + "]");
        }
    }

    public Object getRegistry(String name) {
        return registries.get(name);
    }

    public Map<String, Object> getAll() {
        return registries;
    }
}
