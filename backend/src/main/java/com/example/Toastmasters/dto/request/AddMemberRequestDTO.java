package com.example.Toastmasters.dto.request;

import com.example.Toastmasters.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddMemberRequestDTO {

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 50)
    private String name;

    @NotNull(message = "Date of birth is mandatory")
    private Date dateOfBirth;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Address is mandatory")
    private String address;

    @NotNull(message = "Contact number is mandatory")
    @Min(value = 1000000000L, message = "Contact must be at least 10 digits")
    @Max(value = 9999999999L, message = "Contact must be at most 10 digits")
    private Long contact;

    @NotNull(message = "Date of joining is required")
    private Date doj;

    @NotNull(message = "Gender is required")
    private Gender gender;


    @NotBlank(message = "Password is mandatory")
    @Pattern(
            regexp = "^(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must be at least 8 characters long and contain at least one special character"
    )
    private String password;

    private boolean isActive;

    private Long mentorId;
}
