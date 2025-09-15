package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleResponseDTO {
    private Long roleId;
    private String roleName;
    private String roleDescription;
}
