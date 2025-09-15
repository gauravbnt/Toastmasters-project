package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.request.MemberRoleAssignRequestDTO;
import com.example.Toastmasters.dto.response.MemberRoleAssignResponseDTO;
import com.example.Toastmasters.entity.MemberRoleAssignment;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.mapper.MemberRoleAssignMapper;
import com.example.Toastmasters.repository.MemberRoleAssignmentRepository;
import com.example.Toastmasters.repository.MeetingRoleRepository;
import com.example.Toastmasters.service.MemberRoleAssignService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberRoleAssignServiceImpl implements MemberRoleAssignService {

    private final MemberRoleAssignmentRepository assignmentRepository;
    private final MeetingRoleRepository meetingRoleRepository;
    private final MemberRoleAssignMapper memberRoleAssignMapper;

    // Admin assigns a role to a member

    @Override
    @Transactional
    public List<MemberRoleAssignResponseDTO> assignRole(List<MemberRoleAssignRequestDTO> memberRoleAssignRequestDTO) {

        assignmentRepository.deleteAllByMeetingId(memberRoleAssignRequestDTO.getFirst().getMeetingId());

        List<MemberRoleAssignment> roleAssignments = memberRoleAssignRequestDTO.stream()
                .map(dto -> MemberRoleAssignment.builder()
                        .memberId(dto.getMemberId())
                        .roleId(dto.getRoleId())
                        .meetingId(dto.getMeetingId())
                        .createdAt(LocalDateTime.now())
                        .build())
                .toList();

        List<MemberRoleAssignment> savedAssignments = assignmentRepository.saveAll(roleAssignments);

        return savedAssignments.stream()
                .map(memberRoleAssignMapper::toResponseDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<MemberRoleAssignResponseDTO> getAssignmentsByMeeting(Long meetingId) {
        return assignmentRepository.findByMeetingId(meetingId).stream()
                .map(memberRoleAssignMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Get all assignments for a specific member
    @Override
    public List<MemberRoleAssignResponseDTO> getAssignmentsByMember(Long memberId) {
        return assignmentRepository.findByMemberId(memberId).stream()
                .map(memberRoleAssignMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
