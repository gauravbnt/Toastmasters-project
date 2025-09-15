package com.example.Toastmasters.dto.request;

import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.enums.MeetingType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MeetingRequestDTO {

    @Size(min = 3, max = 100, message = "Meeting theme must be between 3 and 100 characters")
    private String meetingTheme;

    @NotNull(message = "Meeting type is required")
    private MeetingType meetingType;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date cannot be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 255, message = "Location must be between 3 and 255 characters")
    private String location;

    private List<MeetingRoleResponseDTO> roles; // roles selected for this meeting

}
