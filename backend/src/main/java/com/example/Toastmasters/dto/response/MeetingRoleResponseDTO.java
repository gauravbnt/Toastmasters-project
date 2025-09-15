package com.example.Toastmasters.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeetingRoleResponseDTO {
    private Long id;
    private Long roleId;
    private Long meetingId;
    private String roleName;
    private String roleDescription;
    private int count;
}