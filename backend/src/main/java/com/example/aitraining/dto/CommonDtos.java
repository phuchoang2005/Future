package com.example.aitraining.dto;

import java.util.List;
import java.util.UUID;

public final class CommonDtos {
    private CommonDtos() {
    }

    public record Page(int limit, String nextCursor, boolean hasMore) {
    }

    public record ApiError(String code, String message, String correlationId, List<ValidationDetail> details) {
    }

    public record ValidationDetail(String field, String reason) {
    }

    public record ErrorResponse(ApiError error) {
    }

    public record UserSummary(UUID userId, String email, String fullName) {
    }
}
