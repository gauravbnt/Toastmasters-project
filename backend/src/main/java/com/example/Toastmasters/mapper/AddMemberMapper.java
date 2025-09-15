package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.AddMemberRequestDTO;
import com.example.Toastmasters.dto.response.AddMemberResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AddMemberMapper {

    // Convert DTO -> Entity
    @Mapping(target = "memberId", ignore = true)
    AddMember toEntity(AddMemberRequestDTO dto);

    // Convert Entity -> Response DTO
    AddMemberResponseDTO toResponseDTO(AddMember entity);
}
