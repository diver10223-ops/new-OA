package com.smartoa.project;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectStatusTest {
    @Test void permitsOnlyDocumentedTransitions() {
        assertThat(ProjectStatus.DRAFT.canTransitionTo(ProjectStatus.SUBMITTED)).isTrue();
        assertThat(ProjectStatus.SUBMITTED.canTransitionTo(ProjectStatus.ESTABLISHED)).isTrue();
        assertThat(ProjectStatus.SUBMITTED.canTransitionTo(ProjectStatus.REJECTED)).isTrue();
        assertThat(ProjectStatus.SUBMITTED.canTransitionTo(ProjectStatus.CANCELLED)).isTrue();
        assertThat(ProjectStatus.ESTABLISHED.canTransitionTo(ProjectStatus.CLOSED)).isTrue();
        assertThat(ProjectStatus.CLOSED.canTransitionTo(ProjectStatus.DRAFT)).isFalse();
    }
}
