package com.smartoa.assistant;

import jakarta.validation.constraints.NotBlank;

public record AssistantRequest(@NotBlank String text, String org) {
}
