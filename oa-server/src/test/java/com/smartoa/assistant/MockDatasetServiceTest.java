package com.smartoa.assistant;

import com.smartoa.common.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MockDatasetServiceTest {
    private MockDatasetService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new MockDatasetService(Path.of("..", "assistant-config", "mocks"));
        service.init();
    }

    @Test
    void readsAllThreeIndicatorsForBothOrganizations() {
        assertThat(service.getCurrentValue("deposit_balance", "HEADQUARTERS")).isEqualTo(1_200_000_000);
        assertThat(service.getCurrentValue("avg_deposit", "BRANCH_001")).isEqualTo(500_000);
        assertThat(service.getCurrentValue("loan_deposit_ratio", "HEADQUARTERS")).isEqualTo(0.55);
        assertThat(service.getPreviousValue("loan_deposit_ratio", "BRANCH_001")).isEqualTo(0.60);
    }

    @Test
    void readsOrderedTrendPoints() {
        assertThat(service.getTrend("avg_deposit", "BRANCH_001"))
                .hasSize(3)
                .extracting(point -> point.get("period"))
                .containsExactly("2026-05", "2026-06", "2026-07");
        assertThat(service.getTrend("avg_deposit", "BRANCH_001").get(2).get("value"))
                .isEqualTo(500_000);
    }

    @Test
    void rejectsUnknownIndicatorWithRecognizableBusinessError() {
        assertThatThrownBy(() -> service.getCurrentValue("unknown_indicator", "HEADQUARTERS"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("unknown indicator")
                .hasMessageContaining("unknown_indicator");
    }

    @Test
    void rejectsUnknownOrganizationWithRecognizableBusinessError() {
        assertThatThrownBy(() -> service.getCurrentValue("deposit_balance", "UNKNOWN_ORG"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("unknown org")
                .hasMessageContaining("UNKNOWN_ORG");
    }
}
