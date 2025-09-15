package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.MemberAvailabilityRequestDTO;
import com.example.Toastmasters.dto.response.AvailabilitySummaryDTO;
import com.example.Toastmasters.dto.response.MemberAvailabilityResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.MemberAvailability;
import com.example.Toastmasters.enums.AvailabilityStatus;
import com.example.Toastmasters.mapper.MemberAvailabilityMapper;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.repository.MemberAvailabilityRepository;
import com.example.Toastmasters.repository.MeetingRepository;
import com.example.Toastmasters.service.MemberAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberAvailabilityServiceImpl implements MemberAvailabilityService {

    private final MemberAvailabilityRepository repository;
    private final MemberAvailabilityMapper mapper;
    private final AddMemberRepository memberRepository;
    private final MeetingRepository meetingRepository;

    @Override
    public MemberAvailabilityResponseDTO createOrUpdate(MemberAvailabilityRequestDTO requestDTO) {
        Long memberId = requestDTO.getMemberId();
        Long meetingId = requestDTO.getMeetingId();

        MemberAvailability availability = repository.findByMemberIdAndMeetingId(memberId, meetingId)
                .orElseGet(() -> mapper.toEntity(requestDTO)); // create new if not exists

        // Update status
        availability.setAvaStatus(requestDTO.getAvaStatus());

        availability = repository.save(availability);

        AddMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        MemberAvailabilityResponseDTO dto = mapper.toResponse(availability);
        dto.setMemberName(member.getName());
        dto.setMemberEmail(member.getEmail());

        return dto;
    }


    @Override
    public MemberAvailabilityResponseDTO getById(Long avId) {
        MemberAvailability availability = repository.findById(avId)
                .orElseThrow(() -> new RuntimeException("Availability not found with id: " + avId));

        MemberAvailabilityResponseDTO dto = mapper.toResponse(availability);

        // Populate member info manually
        AddMember member = memberRepository.findById(availability.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        dto.setMemberName(member.getName());
        dto.setMemberEmail(member.getEmail());

        return dto;
    }

    @Override
    public List<MemberAvailabilityResponseDTO> getAll() {
        return repository.findAll().stream()
                .map(availability -> {
                    MemberAvailabilityResponseDTO dto = mapper.toResponse(availability);

                    // Populate member info manually
                    AddMember member = memberRepository.findById(availability.getMemberId())
                            .orElseThrow(() -> new RuntimeException("Member not found"));
                    dto.setMemberName(member.getName());
                    dto.setMemberEmail(member.getEmail());

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberAvailability> getAvailabilitiesByMeeting(Long meetingId) {
        return repository.findByMeetingId(meetingId);
    }

    @Override
    public AvailabilitySummaryDTO getAvailabilitySummaryByMeeting(Long meetingId) {
        List<MemberAvailability> list = repository.findByMeetingId(meetingId);

        Map<AvailabilityStatus, Long> grouped = list.stream()
                .collect(Collectors.groupingBy(MemberAvailability::getAvaStatus, Collectors.counting()));

        long available = grouped.getOrDefault(AvailabilityStatus.AVAILABLE, 0L);
        long unavailable = grouped.getOrDefault(AvailabilityStatus.UNAVAILABLE, 0L);
        long maybe = grouped.getOrDefault(AvailabilityStatus.MAYBE, 0L);
        long pending = grouped.getOrDefault(AvailabilityStatus.PENDING, 0L);

        return new AvailabilitySummaryDTO(available, unavailable, maybe, pending);
    }

    @Override
    public List<MemberAvailabilityResponseDTO> getAvailabilitiesByMember(Long memberId) {
        return repository.findByMemberId(memberId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public Map<String, List<MemberAvailabilityResponseDTO>> getAvailabilitiesGroupedByStatus(Long meetingId) {
        List<MemberAvailability> list = repository.findByMeetingId(meetingId);

        return list.stream()
                .map(availability -> {
                    MemberAvailabilityResponseDTO dto = mapper.toResponse(availability);

                    AddMember member = memberRepository.findById(availability.getMemberId())
                            .orElseThrow(() -> new RuntimeException("Member not found"));
                    dto.setMemberName(member.getName());
                    dto.setMemberEmail(member.getEmail());

                    return dto;
                })
                .collect(Collectors.groupingBy(dto -> dto.getAvaStatus().name())); // convert enum → String
    }


}
