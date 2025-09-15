package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.MemberRoleAssignRequestDTO;
import com.example.Toastmasters.dto.response.MemberRoleAssignResponseDTO;
import com.example.Toastmasters.dto.response.MemberRoleStatsDTO;

import java.util.List;

public interface MemberRoleAssignService {
    List<MemberRoleAssignResponseDTO> getAssignmentsByMeeting(Long meetingId);
    List<MemberRoleAssignResponseDTO> getAssignmentsByMember(Long memberId);
    List<MemberRoleAssignResponseDTO> assignRole(List<MemberRoleAssignRequestDTO> memberRoleAssignRequestDTO) ;



    }
