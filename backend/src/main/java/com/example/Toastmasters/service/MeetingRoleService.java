package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;

import java.util.List;

public interface MeetingRoleService{
    MeetingRoleResponseDTO addMeetingRole(MeetingRoleRequestDTO requestDTO);
    MeetingRoleResponseDTO updateMeetingRole(Long id, MeetingRoleRequestDTO requestDTO);
    void deleteMeetingRole(Long id);
    List<MeetingRoleResponseDTO> getMeetingRolesByMeeting(Long meetingId);

}
