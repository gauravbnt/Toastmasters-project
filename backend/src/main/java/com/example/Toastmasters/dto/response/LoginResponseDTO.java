package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String message;
    private String role;   // "ADMIN" or "MEMBER"
    private Long memberId; // <-- add this

}
