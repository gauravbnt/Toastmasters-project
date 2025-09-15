package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.RoleRequestDTO;
import com.example.Toastmasters.dto.response.RoleResponseDTO;
import com.example.Toastmasters.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "roleId", ignore = true)
    Role toEntity(RoleRequestDTO dto);

    RoleResponseDTO toResponseDTO(Role role);
}
