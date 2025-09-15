package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.RolePreferenceRequestDTO;
import com.example.Toastmasters.dto.response.RolePreferenceResponseDTO;
import com.example.Toastmasters.dto.response.MeetingRoleResponseDTO;
import com.example.Toastmasters.service.RolePreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/role-preferences")
@RequiredArgsConstructor
public class RolePreferenceController {

    private final RolePreferenceService service;

    // Get preferences for one member in one meeting
    @GetMapping("/member/{memberId}/meeting/{meetingId}")
    public ResponseEntity<List<RolePreferenceResponseDTO>> get(
            @PathVariable Long memberId,
            @PathVariable Long meetingId) {
        return ResponseEntity.ok(service.getRolePreferences(memberId, meetingId));
    }

    // Add or overwrite preferences (max 3)
    @PostMapping("/add")
    public ResponseEntity<List<RolePreferenceResponseDTO>> set(
            @RequestBody List<RolePreferenceRequestDTO> request) {
        return ResponseEntity.ok(service.setRolePreferences(request));
    }

    // Get all members' preferences for a meeting
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<RolePreferenceResponseDTO>> meeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(service.getMeetingRolePreferences(meetingId));
    }

    // Available roles for a meeting
    @GetMapping("/meeting/{meetingId}/available-roles")
    public ResponseEntity<List<MeetingRoleResponseDTO>> getAvailableRoles(@PathVariable Long meetingId) {
        return ResponseEntity.ok(service.getAvailableRolesForMeeting(meetingId));
    }

}
