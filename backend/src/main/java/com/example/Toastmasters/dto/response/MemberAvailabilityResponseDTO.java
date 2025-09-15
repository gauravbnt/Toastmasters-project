package com.example.Toastmasters.dto.response;

import com.example.Toastmasters.enums.AvailabilityStatus;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberAvailabilityResponseDTO {

    private Long avId;
    private Long memberId;
    private Long meetingId;
    private AvailabilityStatus avaStatus;

    // 🔹 extra fields to show member info
    private String memberName;
    private String memberEmail;
}
