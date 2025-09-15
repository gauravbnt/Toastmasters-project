package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.RolePreferenceRequestDTO;
import com.example.Toastmasters.dto.response.RolePreferenceResponseDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.entity.RolePreference;
import com.example.Toastmasters.mapper.RolePreferenceMapper;
import com.example.Toastmasters.repository.MeetingRoleRepository;
import com.example.Toastmasters.repository.RolePreferenceRepository;
import com.example.Toastmasters.service.RolePreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolePreferenceServiceImpl implements RolePreferenceService {

    private final RolePreferenceRepository rolePreferenceRepository;
    private final MeetingRoleRepository meetingRoleRepository;
    private  final RolePreferenceMapper rolePreferenceMapper;

    @Override
    @Transactional
    public List<RolePreferenceResponseDTO> setRolePreferences(List<RolePreferenceRequestDTO> request) {

        // delete old preferences for this member in this meeting
        rolePreferenceRepository.deleteByMeetingIdAndMemberId(
                request.getFirst().getMeetingId(),
                request.getFirst().getMemberId()
        );

        // map request DTOs to entities and set createdAt
        List<RolePreference> preferences = request.stream()
                .map(x -> {
                    RolePreference entity = rolePreferenceMapper.toEntity(x);
                    entity.setCreatedAt(LocalDateTime.now());
                    return entity;
                })
                .collect(Collectors.toList());

        // save new preferences
        List<RolePreference> saved = rolePreferenceRepository.saveAll(preferences);

        // convert entities back to response DTOs
        return saved.stream()
                .map(rolePreferenceMapper::toResponseDTO)
                .collect(Collectors.toList());
    }


   @Override
    public List<RolePreferenceResponseDTO> getRolePreferences(Long memberId, Long meetingId) {
       List<RolePreference> preferences = rolePreferenceRepository.findByMeetingIdAndMemberIdOrderByPrefOrderAsc(meetingId, memberId);

        return preferences.stream().map(x->rolePreferenceMapper.toResponseDTO(x)).collect(Collectors.toList());
    }

    @Override
    public List<RolePreferenceResponseDTO> getMeetingRolePreferences(Long meetingId) {
        List<RolePreference> byMeetingId = rolePreferenceRepository.findByMeetingId(meetingId);

        return byMeetingId.stream().map(x->rolePreferenceMapper.toResponseDTO(x)).collect(Collectors.toList());
    }

    @Override
    public List<MeetingRoleResponseDTO> getAvailableRolesForMeeting(Long meetingId) {
        List<MeetingRole> meetingRoles = meetingRoleRepository.findByMeetingMeetingId(meetingId);

        return meetingRoles.stream()
                .sorted((a, b) -> b.getMeeting().getMeetingId().compareTo(a.getMeeting().getMeetingId()))
                .map(this::toMeetingRoleDTO)
                .toList();
    }

    private MeetingRoleResponseDTO toMeetingRoleDTO(MeetingRole meetingRole) {
        return MeetingRoleResponseDTO.builder()
                .id(meetingRole.getId())
                .roleId(meetingRole.getRole().getRoleId())
                .roleName(meetingRole.getRole().getRoleName())
                .roleDescription(meetingRole.getRole().getRoleDescription())
                .count(meetingRole.getCount())
                .build();
    }
}
