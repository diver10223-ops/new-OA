package com.smartoa.assistant;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RegistryLoaderTest {
    @TempDir
    Path tempDir;

    @Test
    void loadsAndValidatesTheCompleteRegistry() throws Exception {
        RegistryLoader loader = new RegistryLoader(Path.of("..", "assistant-config"));

        loader.load();

        assertThat(loader.getRegistry("intents.yml")).isNotNull();
        assertThat(loader.getRegistry("scenarios.yml")).isNotNull();
        assertThat(loader.getAll()).containsKeys(
                "intents.yml", "scenarios.yml", "skills.yml", "templates.yml", "policies.yml");
    }

    @Test
    void reportsTheConfigurationTypeAndMissingReferenceId() throws Exception {
        copyRegistryFiles(tempDir);
        Path scenarios = tempDir.resolve("scenarios.yml");
        Files.writeString(scenarios, Files.readString(scenarios)
                .replace("template: indicator_card", "template: missing_card"));
        RegistryLoader loader = new RegistryLoader(tempDir);

        assertThatThrownBy(loader::load)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("template")
                .hasMessageContaining("missing_card");
    }

    private void copyRegistryFiles(Path destination) throws Exception {
        Path source = Path.of("..", "assistant-config");
        for (String name : new String[]{
                "intents.yml", "scenarios.yml", "skills.yml", "templates.yml", "policies.yml"}) {
            Files.copy(source.resolve(name), destination.resolve(name));
        }
    }
}
