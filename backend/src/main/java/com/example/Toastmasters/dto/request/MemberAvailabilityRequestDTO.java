package com.example.Toastmasters.dto.request;

import com.example.Toastmasters.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberAvailabilityRequestDTO {

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Meeting ID is required")
    private Long meetingId;

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus avaStatus;
}
