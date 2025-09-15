package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.MemberRoleAssignRequestDTO;
import com.example.Toastmasters.dto.response.MemberRoleAssignResponseDTO;
import com.example.Toastmasters.entity.MemberRoleAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MemberRoleAssignMapper {

    // Entity -> Response DTO
    MemberRoleAssignResponseDTO toResponseDTO(MemberRoleAssignment entity);

    // Request DTO -> Entity
    @Mapping(target = "id", ignore = true) // DB will generate ID
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    MemberRoleAssignment toEntity(MemberRoleAssignRequestDTO dto);
}
