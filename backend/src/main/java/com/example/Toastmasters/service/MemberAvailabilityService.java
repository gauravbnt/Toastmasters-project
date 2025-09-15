package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.MemberAvailabilityRequestDTO;
import com.example.Toastmasters.dto.response.AvailabilitySummaryDTO;
import com.example.Toastmasters.dto.response.MemberAvailabilityResponseDTO;
import com.example.Toastmasters.entity.MemberAvailability;
import com.example.Toastmasters.enums.AvailabilityStatus;

import java.util.List;
import java.util.Map;

public interface MemberAvailabilityService {

    public MemberAvailabilityResponseDTO createOrUpdate(MemberAvailabilityRequestDTO requestDTO);

    MemberAvailabilityResponseDTO getById(Long avId);

    List<MemberAvailabilityResponseDTO> getAll();

    List<MemberAvailability> getAvailabilitiesByMeeting(Long meetingId);

    public List<MemberAvailabilityResponseDTO> getAvailabilitiesByMember(Long memberId) ;

    AvailabilitySummaryDTO getAvailabilitySummaryByMeeting(Long meetingId);

    // 🔹 NEW: grouped by status
    public Map<String, List<MemberAvailabilityResponseDTO>> getAvailabilitiesGroupedByStatus(Long meetingId) ;
}
