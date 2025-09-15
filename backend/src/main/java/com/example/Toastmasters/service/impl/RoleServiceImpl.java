package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.RoleRequestDTO;
import com.example.Toastmasters.dto.response.RoleResponseDTO;
import com.example.Toastmasters.entity.Role;
import com.example.Toastmasters.exception.RoleNotFoundException;
import com.example.Toastmasters.mapper.RoleMapper;
import com.example.Toastmasters.repository.RoleRepository;
import com.example.Toastmasters.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }
    @Override
    public RoleResponseDTO addRole(RoleRequestDTO dto) {
        Role role = roleMapper.toEntity(dto);
        Role savedRole = roleRepository.save(role);
        return roleMapper.toResponseDTO(savedRole);
    }

    @Override
    public RoleResponseDTO getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with ID: " + roleId));
        return roleMapper.toResponseDTO(role);
    }

    @Override
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponseDTO updateRole(Long roleId, RoleRequestDTO dto) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role not found with ID: " + roleId));

        role.setRoleName(dto.getRoleName());
        role.setRoleDescription(dto.getRoleDescription());

        Role updatedRole = roleRepository.save(role);
        return roleMapper.toResponseDTO(updatedRole);
    }

    @Override
    public String deleteRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new RoleNotFoundException("Role not found with ID: " + roleId);
        }
        roleRepository.deleteById(roleId);
        return "Role deleted successfully";
    }
}
