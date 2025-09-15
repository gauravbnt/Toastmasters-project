package com.example.Toastmasters.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleRequestDTO {

    @NotBlank(message = "Role name is mandatory")
    @Size(min = 2, max = 50, message = "Role name must be between 2 and 50 characters")
    private String roleName;

    @NotBlank(message = "Role description is mandatory")
    @Size(min = 5, max = 255, message = "Role description must be between 5 and 255 characters")
    private String roleDescription;
}
