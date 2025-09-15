package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.entity.Role;
import com.example.Toastmasters.exception.MeetingNotFoundException;
import com.example.Toastmasters.exception.RoleNotFoundException;
import com.example.Toastmasters.mapper.MeetingRoleMapper;
import com.example.Toastmasters.repository.MeetingRepository;
import com.example.Toastmasters.repository.MeetingRoleRepository;
import com.example.Toastmasters.repository.RoleRepository;
import com.example.Toastmasters.service.MeetingRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingRoleServiceImpl implements MeetingRoleService {

    private final MeetingRoleRepository meetingRoleRepository;
    private final MeetingRepository meetingRepository;
    private final RoleRepository roleRepository;
    private final MeetingRoleMapper meetingRoleMapper;

    public  MeetingRoleServiceImpl( MeetingRoleRepository meetingRoleRepository,
     MeetingRepository meetingRepository,
     RoleRepository roleRepository,
     MeetingRoleMapper meetingRoleMapper
    ){
        this.meetingRoleRepository=meetingRoleRepository;
        this.meetingRepository=meetingRepository;
        this.roleRepository=roleRepository;
        this.meetingRoleMapper=meetingRoleMapper;
    }

    @Override
    public MeetingRoleResponseDTO addMeetingRole(MeetingRoleRequestDTO requestDTO) {
        Meeting meeting = meetingRepository.findById(requestDTO.getMeetingId())
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found: " + requestDTO.getMeetingId()));
        Role role = roleRepository.findById(requestDTO.getRoleId())
                .orElseThrow(() -> new RoleNotFoundException("Role not found: " + requestDTO.getRoleId()));

        MeetingRole meetingRole = meetingRoleMapper.toEntity(requestDTO, meeting, role);
        MeetingRole saved = meetingRoleRepository.save(meetingRole);

        return meetingRoleMapper.toResponseDTO(saved);
    }

    @Override
    public MeetingRoleResponseDTO updateMeetingRole(Long id, MeetingRoleRequestDTO requestDTO) {
        MeetingRole existing = meetingRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MeetingRole not found: " + id));

        Meeting meeting = meetingRepository.findById(requestDTO.getMeetingId())
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found: " + requestDTO.getMeetingId()));
        Role role = roleRepository.findById(requestDTO.getRoleId())
                .orElseThrow(() -> new RoleNotFoundException("Role not found: " + requestDTO.getRoleId()));

        existing.setMeeting(meeting);
        existing.setRole(role);
        existing.setCount(requestDTO.getCount());

        MeetingRole updated = meetingRoleRepository.save(existing);

        return meetingRoleMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteMeetingRole(Long id) {
        MeetingRole existing = meetingRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MeetingRole not found: " + id));
        meetingRoleRepository.delete(existing);
    }

    @Override
    public List<MeetingRoleResponseDTO> getMeetingRolesByMeeting(Long meetingId) {
        List<MeetingRole> roles = meetingRoleRepository.findByMeetingMeetingId(meetingId);
        return roles.stream()
                .map(meetingRoleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
