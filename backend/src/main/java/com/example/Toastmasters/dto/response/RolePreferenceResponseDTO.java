package com.example.Toastmasters.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePreferenceResponseDTO {

    private Long id;
    private Long memberId;
    private Long meetingId;
    private Long roleId;
    private int prefOrder;
    private LocalDateTime createdAt;

}
