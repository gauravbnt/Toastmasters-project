package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.MemberAvailabilityRequestDTO;
import com.example.Toastmasters.dto.response.AvailabilitySummaryDTO;
import com.example.Toastmasters.dto.response.MemberAvailabilityResponseDTO;
import com.example.Toastmasters.enums.AvailabilityStatus;
import com.example.Toastmasters.mapper.MemberAvailabilityMapper;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.repository.MeetingRepository;
import com.example.Toastmasters.service.MemberAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/availabilities")
@RequiredArgsConstructor
public class MemberAvailabilityController {

    private final MemberAvailabilityService service;
    private final MemberAvailabilityMapper mapper;
    private final AddMemberRepository memberRepository;
    private final MeetingRepository meetingRepository;

    // POST - Create or Update Availability
    @PostMapping("/create-or-update")
    public ResponseEntity<?> createOrUpdate(@Valid @RequestBody MemberAvailabilityRequestDTO requestDTO) {
        try {
            System.out.println("Received create/update request with DTO: " + requestDTO);
            System.out.println("Member ID: " + requestDTO.getMemberId() + ", Meeting ID: " + requestDTO.getMeetingId() + ", Status: " + requestDTO.getAvaStatus());
            
            // Validate member exists
            if (!memberRepository.existsById(requestDTO.getMemberId())) {
                System.err.println("Member not found with ID: " + requestDTO.getMemberId());
                return ResponseEntity.badRequest().body("Member not found with ID: " + requestDTO.getMemberId());
            }
            
            // Validate meeting exists
            if (!meetingRepository.existsById(requestDTO.getMeetingId())) {
                System.err.println("Meeting not found with ID: " + requestDTO.getMeetingId());
                return ResponseEntity.badRequest().body("Meeting not found with ID: " + requestDTO.getMeetingId());
            }
            
            MemberAvailabilityResponseDTO response = service.createOrUpdate(requestDTO);
            System.out.println("Successfully processed request. Response: " + response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error processing create/update request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // GET - Get Availability by ID
    @GetMapping("/{avId}")
    public ResponseEntity<MemberAvailabilityResponseDTO> getById(@PathVariable Long avId) {
        return ResponseEntity.ok(service.getById(avId));
    }

    // GET - Get all availabilities for a specific member
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<MemberAvailabilityResponseDTO>> getByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(service.getAvailabilitiesByMember(memberId));
    }



    // GET - Get All Availabilities
    @GetMapping
    public ResponseEntity<List<MemberAvailabilityResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET - Get availability grouped by status for a meeting
    @GetMapping("/meeting/{meetingId}/statuses")
    public ResponseEntity<Map<String, List<MemberAvailabilityResponseDTO>>> getMemberStatusesByMeeting(
            @PathVariable Long meetingId) {
        return ResponseEntity.ok(service.getAvailabilitiesGroupedByStatus(meetingId));
    }


    // GET - Get summary counts (available/unavailable/maybe/pending)
    @GetMapping("/meeting/{meetingId}/summary")
    public ResponseEntity<AvailabilitySummaryDTO> getSummary(@PathVariable Long meetingId) {
        return ResponseEntity.ok(service.getAvailabilitySummaryByMeeting(meetingId));
    }
}
