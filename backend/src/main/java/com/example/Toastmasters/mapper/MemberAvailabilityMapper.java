package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.MemberAvailabilityRequestDTO;
import com.example.Toastmasters.dto.response.MemberAvailabilityResponseDTO;
import com.example.Toastmasters.entity.MemberAvailability;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MemberAvailabilityMapper {

    // Convert DTO → Entity (ignore avId, memId and meetingId come from DTO)
    @Mapping(target = "avId", ignore = true)
    MemberAvailability toEntity(MemberAvailabilityRequestDTO dto);

    // Convert Entity → DTO
    @Mapping(target = "avId", source = "avId")
    @Mapping(target = "memberId", source = "memberId")          // map directly from Long field
    @Mapping(target = "meetingId", source = "meetingId")  // map directly from Long field
    @Mapping(target = "avaStatus", source = "avaStatus")
    @Mapping(target = "memberName", ignore = true)        // set manually in service
    @Mapping(target = "memberEmail", ignore = true)       // set manually in service
    MemberAvailabilityResponseDTO toResponse(MemberAvailability entity);
}
