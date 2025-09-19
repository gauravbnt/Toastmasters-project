package com.example.Toastmasters.dto.request;

import com.example.Toastmasters.entity.RolePreference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignRolesHelperDTO {

    private Long id;
    private String name;
    private List<RolePreference> pref_roles;
    private Long meeting_id;
}
