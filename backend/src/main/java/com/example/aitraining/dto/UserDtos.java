package com.example.aitraining.dto;

import com.example.aitraining.domain.Enums.UserRole;
import com.example.aitraining.domain.Enums.UserStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class UserDtos {
    private UserDtos() {
    }

    public record CurrentUser(UUID userId, String email, String fullName, UserRole role, UserStatus status,
                              Instant lastLoginAt) {
    }

    public record UserPage(List<CurrentUser> data, CommonDtos.Page page) {
    }

    public record UpdateUserStatusRequest(@NotNull UserStatus status) {
    }

    public record UserStatusResponse(UUID userId, UserStatus status) {
    }
}
