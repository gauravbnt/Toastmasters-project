package com.example.Toastmasters.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberRoleAssignResponseDTO {
    private Long id;
    private Long meetingId;
    private Long memberId;
    private Long roleId;
    private LocalDateTime createdAt;
}
