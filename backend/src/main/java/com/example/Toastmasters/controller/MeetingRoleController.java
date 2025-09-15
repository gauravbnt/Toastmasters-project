package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.MeetingRoleRequestDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.service.MeetingRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meeting-roles")
@RequiredArgsConstructor
public class MeetingRoleController {

    private final MeetingRoleService meetingRoleService;

    @PostMapping("/add")
    public ResponseEntity<MeetingRoleResponseDTO> addMeetingRole(@RequestBody MeetingRoleRequestDTO requestDTO) {
        return ResponseEntity.ok(meetingRoleService.addMeetingRole(requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingRoleResponseDTO> updateMeetingRole(
            @PathVariable Long id,
            @RequestBody MeetingRoleRequestDTO requestDTO) {
        return ResponseEntity.ok(meetingRoleService.updateMeetingRole(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeetingRole(@PathVariable Long id) {
        meetingRoleService.deleteMeetingRole(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<MeetingRoleResponseDTO>> getMeetingRolesByMeeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(meetingRoleService.getMeetingRolesByMeeting(meetingId));
    }
}