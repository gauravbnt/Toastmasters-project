package com.example.Toastmasters.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePreferenceRequestDTO {

    private Long memberId;
    private Long meetingId;
    private Long roleId;
    private int prefOrder;

}
