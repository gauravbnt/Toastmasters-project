package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.MeetingRequestDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.enums.MeetingType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MeetingMapper {

    @Mapping(target = "meetingId", ignore = true)
    Meeting toEntity(MeetingRequestDTO meetingRequestDTO);

    @Mapping(target = "color", ignore = true)
    @Mapping(target = "roles", source = "meetingRoles")
    MeetingResponseDTO toResponseDTO(Meeting meeting);

    @AfterMapping
    default void setColor(Meeting meeting, @MappingTarget MeetingResponseDTO dto) {
        String color;
        MeetingType type = meeting.getMeetingType();
        if (type == MeetingType.CONTEST) {
            color = "#e53935"; // red
        } else if (type == MeetingType.SPECIAL) {
            color = "#8e24aa"; // purple
        } else { // REGULAR or others
            color = "#1e88e5"; // blue
        }
        dto.setColor(color);
    }
}
