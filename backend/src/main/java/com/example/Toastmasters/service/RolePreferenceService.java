package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.RolePreferenceRequestDTO;
import com.example.Toastmasters.dto.response.RolePreferenceResponseDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;

import java.util.List;

public interface RolePreferenceService {
    List<RolePreferenceResponseDTO> setRolePreferences(List<RolePreferenceRequestDTO> request);
    List<RolePreferenceResponseDTO> getRolePreferences(Long memberId, Long meetingId);
    List<RolePreferenceResponseDTO> getMeetingRolePreferences(Long meetingId);
    List<MeetingRoleResponseDTO> getAvailableRolesForMeeting(Long meetingId);
}
