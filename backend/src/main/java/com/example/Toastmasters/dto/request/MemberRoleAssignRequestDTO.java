package com.example.Toastmasters.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberRoleAssignRequestDTO {
    private Long meetingId;
    private Long memberId;
    private Long roleId;
}
