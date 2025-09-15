package com.example.Toastmasters.dto.response;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberRoleStatsDTO {
    private Long memberId;
    private Map<Long, Long> roleCounts; // roleId -> count
    private Long totalAssignments;
}
