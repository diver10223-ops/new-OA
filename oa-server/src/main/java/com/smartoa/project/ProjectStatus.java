package com.smartoa.project;

import java.util.Set;

public enum ProjectStatus {
    DRAFT, SUBMITTED, ESTABLISHED, REJECTED, CANCELLED, CLOSED;

    public boolean canTransitionTo(ProjectStatus target) {
        return switch (this) {
            case DRAFT -> Set.of(SUBMITTED).contains(target);
            case SUBMITTED -> Set.of(ESTABLISHED, REJECTED, CANCELLED).contains(target);
            case ESTABLISHED -> target == CLOSED;
            default -> false;
        };
    }
}
