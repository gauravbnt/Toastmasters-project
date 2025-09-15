package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MeetingRoleMapper {

    // Map RequestDTO -> Entity
    default MeetingRole toEntity(MeetingRoleRequestDTO dto, Meeting meeting, Role role) {
        MeetingRole meetingRole = new MeetingRole();
        meetingRole.setMeeting(meeting);
        meetingRole.setRole(role);
        meetingRole.setCount(dto.getCount());
        return meetingRole;
    }

    // Map Entity -> ResponseDTO
    default MeetingRoleResponseDTO toResponseDTO(MeetingRole entity) {
        MeetingRoleResponseDTO dto = new MeetingRoleResponseDTO();
        dto.setId(entity.getId());
        dto.setMeetingId(entity.getMeeting().getMeetingId());
        dto.setRoleId(entity.getRole().getRoleId());
        dto.setRoleName(entity.getRole().getRoleName());
        dto.setRoleDescription(entity.getRole().getRoleDescription());
        dto.setCount(entity.getCount());
        return dto;
    }

}
