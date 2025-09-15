package com.example.Toastmasters.dto.response;

import com.example.Toastmasters.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddMemberResponseDTO {
    private Long memberId; // Changed from String → Long
    private String name;
    private Date dateOfBirth;
    private String email;
    private String address;
    private Long contact;
    private Date doj;
    private Gender gender;
    private Long mentorId; // Changed to Long
    private boolean isActive;


}
