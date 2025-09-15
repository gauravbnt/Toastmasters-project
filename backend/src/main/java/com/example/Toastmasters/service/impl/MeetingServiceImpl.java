package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.MeetingRequestDTO;
import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.entity.Role;
import com.example.Toastmasters.entity.MemberAvailability;
import com.example.Toastmasters.exception.MeetingNotFoundException;
import com.example.Toastmasters.exception.RoleNotFoundException;
import com.example.Toastmasters.mapper.MeetingMapper;
import com.example.Toastmasters.mapper.MeetingRoleMapper;
import com.example.Toastmasters.repository.*;
//import com.example.Toastmasters.service.MeetingRoleService;
import com.example.Toastmasters.service.MeetingRoleService;
import com.example.Toastmasters.service.MeetingService;
import com.example.Toastmasters.enums.AvailabilityStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingMapper meetingMapper;
    private final MemberAvailabilityRepository memberAvailabilityRepository;
    private final AddMemberRepository addMemberRepository;
    private final RoleRepository roleRepository;
    private final MeetingRoleRepository meetingRoleRepository;
    private final MeetingRoleService meetingRoleService;

    public MeetingServiceImpl(MeetingRepository meetingRepository, MeetingMapper meetingMapper, MemberAvailabilityRepository memberAvailabilityRepository, AddMemberRepository addMemberRepository, RoleRepository roleRepository, MeetingRoleRepository meetingRoleRepository, MeetingRoleService meetingRoleService) {
        this.meetingRepository = meetingRepository;
        this.meetingMapper = meetingMapper;
        this.memberAvailabilityRepository = memberAvailabilityRepository;
        this.addMemberRepository = addMemberRepository;
        this.roleRepository = roleRepository;
        this.meetingRoleRepository = meetingRoleRepository;
        this.meetingRoleService = meetingRoleService;
    }

    @Override
    @Transactional
    public MeetingResponseDTO createMeeting(MeetingRequestDTO requestDTO) {
        validateSchedule(requestDTO.getStartTime(), requestDTO.getEndTime());

        // Normalize time
        requestDTO.setStartTime(normalizeTime(requestDTO.getStartTime()));
        requestDTO.setEndTime(normalizeTime(requestDTO.getEndTime()));

        // Map basic meeting fields
        Meeting meeting = meetingMapper.toEntity(requestDTO);

        // Save meeting first (so it has a meetingId for roles)
        Meeting savedMeeting = meetingRepository.save(meeting);

        // ✅ Add roles using MeetingRoleService (reuse existing logic)
        if (requestDTO.getRoles() != null && !requestDTO.getRoles().isEmpty()) {
            for (var r : requestDTO.getRoles()) {
                MeetingRoleRequestDTO roleRequest = new MeetingRoleRequestDTO();
                roleRequest.setMeetingId(savedMeeting.getMeetingId());
                roleRequest.setRoleId(r.getRoleId());
                roleRequest.setCount(r.getCount());

                meetingRoleService.addMeetingRole(roleRequest); // delegate to service
            }
        }

        // Seed availability for all members
        seedAvailabilityForAllMembers(savedMeeting.getMeetingId());

        // Fetch updated meeting (with roles) for response
        Meeting updatedMeeting = meetingRepository.findById(savedMeeting.getMeetingId())
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found after save"));

        return mapMeetingToDTO(updatedMeeting);
    }


    @Override
    public List<MeetingResponseDTO> getAllMeetings() {
        List<Meeting> meetings = meetingRepository.findAll();
        List<MeetingResponseDTO> dtos = new ArrayList<>();
        for (Meeting m : meetings) {
            dtos.add(mapMeetingToDTO(m));
        }
        return dtos;
    }

    @Override
    public MeetingResponseDTO getMeetingById(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with ID: " + meetingId));
        return mapMeetingToDTO(meeting);
    }

    @Override
    @Transactional
    public MeetingResponseDTO updateMeeting(Long meetingId, MeetingRequestDTO requestDTO) {
        Meeting existingMeeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with ID: " + meetingId));

        validateSchedule(requestDTO.getStartTime(), requestDTO.getEndTime());

        // Normalize time
        requestDTO.setStartTime(normalizeTime(requestDTO.getStartTime()));
        requestDTO.setEndTime(normalizeTime(requestDTO.getEndTime()));

        existingMeeting.setMeetingTheme(requestDTO.getMeetingTheme());
        existingMeeting.setMeetingType(requestDTO.getMeetingType());
        existingMeeting.setDate(requestDTO.getDate());
        existingMeeting.setStartTime(requestDTO.getStartTime());
        existingMeeting.setEndTime(requestDTO.getEndTime());
        existingMeeting.setLocation(requestDTO.getLocation());

        // Update roles safely
        List<MeetingRole> updatedRoles = new ArrayList<>();
        if (requestDTO.getRoles() != null) {
            for (var r : requestDTO.getRoles()) {
                Role role = roleRepository.findById(r.getRoleId())
                        .orElseThrow(() -> new RoleNotFoundException("Role not found: " + r.getRoleId()));
                MeetingRole mr = new MeetingRole();
                mr.setMeeting(existingMeeting); // 👈 must set parent
                mr.setRole(role);
                mr.setCount(r.getCount());
                updatedRoles.add(mr);
            }
        }
        existingMeeting.getMeetingRoles().clear();
        existingMeeting.getMeetingRoles().addAll(updatedRoles);

        Meeting updatedMeeting = meetingRepository.save(existingMeeting);
        return mapMeetingToDTO(updatedMeeting);
    }

    @Override
    public void deleteMeeting(Long meetingId) {
        if (!meetingRepository.existsById(meetingId)) {
            throw new MeetingNotFoundException("Meeting not found with ID: " + meetingId);
        }
        meetingRepository.deleteById(meetingId);
    }

    private void validateSchedule(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void seedAvailabilityForAllMembers(Long meetingId) {
        List<AddMember> allMembers = addMemberRepository.findAll();

        List<MemberAvailability> availabilities = new ArrayList<>();
        for (AddMember member : allMembers) {
            MemberAvailability availability = MemberAvailability.builder()
                    .memberId(member.getMemberId())
                    .meetingId(meetingId)
                    .avaStatus(AvailabilityStatus.PENDING)
                    .build();
            availabilities.add(availability);
        }
        memberAvailabilityRepository.saveAll(availabilities);
    }

    // 🔹 Helper to map Meeting → MeetingResponseDTO including roles
    private MeetingResponseDTO mapMeetingToDTO(Meeting meeting) {
        MeetingResponseDTO dto = meetingMapper.toResponseDTO(meeting);

        if (meeting.getMeetingRoles() != null) {
            List<MeetingRoleResponseDTO> roleDTOs = new ArrayList<>();
            for (MeetingRole mr : meeting.getMeetingRoles()) {
                MeetingRoleResponseDTO rDto = new MeetingRoleResponseDTO();
                rDto.setId(mr.getId());  // 👈
                rDto.setRoleId(mr.getRole().getRoleId());
                rDto.setRoleName(mr.getRole().getRoleName());
                rDto.setRoleDescription(mr.getRole().getRoleDescription());
                rDto.setCount(mr.getCount());
                roleDTOs.add(rDto);
            }
            dto.setRoles(roleDTOs);
        }

        return dto;
    }


    // 🔹 Helper to normalize time to HH:mm:ss
    private LocalTime normalizeTime(LocalTime time) {
        return time; // already LocalTime, so no change needed
    }

    private String normalizeTime(String time) {
        if (time == null) return null;
        String[] parts = time.split(":");
        if (parts.length == 3) return time;        // HH:mm:ss
        if (parts.length == 2) return time + ":00"; // HH:mm
        return time;
    }

}
