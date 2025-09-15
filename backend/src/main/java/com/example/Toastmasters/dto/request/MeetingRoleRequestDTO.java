package com.example.Toastmasters.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MeetingRoleRequestDTO {
    private Long meetingId;   // reference to meeting
    private Long roleId;      // reference to role
    private int count;
}
