package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@Component
public class RegistryLoader {
    private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    private final ObjectMapper json = new ObjectMapper();

    private final Map<String,Object> registries = new HashMap<>();

    @PostConstruct
    public void load() throws Exception {
        File cfg = new File("assistant-config");
        if (!cfg.exists()) return;
        Files.list(cfg.toPath()).forEach(path -> {
            try {
                String name = path.getFileName().toString();
                if (name.endsWith(".yml") || name.endsWith(".yaml")) {
                    Object obj = yaml.readValue(path.toFile(), Object.class);
                    registries.put(name, obj);
                } else if (name.endsWith(".json")) {
                    Object obj = json.readValue(path.toFile(), Object.class);
                    registries.put(name, obj);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to load config: " + path + " : " + e.getMessage(), e);
            }
        });
    }

    public Object getRegistry(String name) {
        return registries.get(name);
    }

    public Map<String,Object> getAll() {
        return registries;
    }
}
