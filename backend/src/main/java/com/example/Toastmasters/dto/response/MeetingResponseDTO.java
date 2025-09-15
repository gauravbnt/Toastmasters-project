package com.example.Toastmasters.dto.response;

import com.example.Toastmasters.enums.MeetingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MeetingResponseDTO {
    private Long meetingId;
    private String meetingTheme;
    private MeetingType meetingType;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String color; // UI hint for meeting type


    private List<MeetingRoleResponseDTO> roles; // <-- include roles

}
