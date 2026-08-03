package com.smartoa.project;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ProjectDtos {
    private ProjectDtos() {}

    public record Request(
            @NotBlank @Size(max = 200) String projectName,
            @NotBlank @Size(max = 100) String projectOwner,
            @NotNull LocalDate plannedStartDate,
            @NotNull LocalDate plannedEndDate,
            @NotNull @DecimalMin("0.00") @Digits(integer = 14, fraction = 2) BigDecimal budget,
            @NotBlank @Size(max = 1000) String summary) {}

    public record Response(long id, String applicationNo, long applicantId, String applicantName,
            long departmentId, String departmentName, String projectName, String projectCode,
            String projectOwner, LocalDate plannedStartDate, LocalDate plannedEndDate,
            BigDecimal budget, String summary, ProjectStatus businessStatus,
            Long approvalInstanceId, LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
