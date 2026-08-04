package com.smartoa.assistant.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartoa.assistant.MockDatasetService;
import com.smartoa.assistant.RegistryLoader;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class AssistantConfigAdminServiceTest {
    private final AssistantConfigAdminService service = new AssistantConfigAdminService(
            new ObjectMapper(), mock(RegistryLoader.class), mock(MockDatasetService.class));

    private String valid() {
        return """
          {"users":[],"indicators":[{"code":"ratio_metric","name":"占比","unit":"%","calculation":"小数存储","updatedAt":"2026-07-31T18:00:00Z","orgData":{"HQ":{"current":0.55,"previous":0.53,"trend":[{"period":"2026-07","value":0.55}]}}}],"candidates":{"case":["ratio_metric"]}}
          """;
    }

    @Test void acceptsUniqueCodeAndPreservesPercentageDecimals() {
        assertThat(service.validate(valid()).valid()).isTrue();
        assertThat(valid()).contains("\"current\":0.55", "\"value\":0.55");
    }
    @Test void rejectsDuplicateAndIllegalCodes() {
        String duplicate = valid().replace("],\"candidates\"", ",{\"code\":\"ratio_metric\",\"name\":\"二\",\"unit\":\"元\",\"calculation\":\"口径\",\"updatedAt\":\"2026-07-31T18:00:00Z\",\"orgData\":{}}],\"candidates\"");
        assertThat(paths(duplicate)).contains("indicators[1].code");
        assertThat(paths(valid().replace("ratio_metric", "Bad-Code"))).contains("indicators[0].code");
    }
    @Test void rejectsBlankNameAndInvalidTimestamp() {
        assertThat(paths(valid().replace("\"name\":\"占比\"", "\"name\":\" \""))).contains("indicators[0].name");
        assertThat(paths(valid().replace("2026-07-31T18:00:00Z", "not-time"))).contains("indicators[0].updatedAt");
    }
    @Test void rejectsNonNumericCurrentPreviousAndTrendValue() {
        assertThat(paths(valid().replace("\"current\":0.55", "\"current\":\"x\""))).contains("indicators[0].orgData.HQ.current");
        assertThat(paths(valid().replace("\"previous\":0.53", "\"previous\":null"))).contains("indicators[0].orgData.HQ.previous");
        assertThat(paths(valid().replace("\"value\":0.55", "\"value\":\"55%\""))).contains("indicators[0].orgData.HQ.trend[0].value");
    }
    @Test void rejectsDuplicatePeriodsAndMissingCandidateReference() {
        String duplicate = valid().replace("]}}}],", ",{\"period\":\"2026-07\",\"value\":0.54}]}}}],");
        assertThat(paths(duplicate)).contains("indicators[0].orgData.HQ.trend[1].period");
        assertThat(paths(valid().replace("\"case\":[\"ratio_metric\"]", "\"case\":[\"missing\"]"))).contains("candidates.case[0]");
    }
    private java.util.List<String> paths(String content) { return service.validate(content).errors().stream().map(AssistantConfigAdminService.ValidationError::path).toList(); }
}
