package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.RoleRequestDTO;
import com.example.Toastmasters.dto.response.RoleResponseDTO;

import java.util.List;

public interface RoleService {
    RoleResponseDTO addRole(RoleRequestDTO roleRequestDTO);
    RoleResponseDTO getRoleById(Long roleId);
    List<RoleResponseDTO> getAllRoles();
    RoleResponseDTO updateRole(Long roleId, RoleRequestDTO roleRequestDTO);
    String deleteRole(Long roleId);
}
