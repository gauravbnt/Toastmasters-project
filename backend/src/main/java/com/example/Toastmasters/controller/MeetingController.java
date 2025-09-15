package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.MeetingRequestDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import com.example.Toastmasters.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    // Create meeting
    @PostMapping("/add")
    public MeetingResponseDTO createMeeting(@Valid @RequestBody MeetingRequestDTO requestDTO) {
        return meetingService.createMeeting(requestDTO);
    }

    // Get all meetings
    @GetMapping("/getall")
    public List<MeetingResponseDTO> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    // Get meeting by ID
    @GetMapping("/{id}")
    public MeetingResponseDTO getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id);
    }

    //  Update meeting
    @PutMapping("/{id}")
    public MeetingResponseDTO updateMeeting(@PathVariable Long id,
                                            @Valid @RequestBody MeetingRequestDTO requestDTO) {
        return meetingService.updateMeeting(id, requestDTO);
    }

    // Delete meeting
    @DeleteMapping("/{id}")
    public String deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
        return "Meeting deleted successfully";
    }
}
