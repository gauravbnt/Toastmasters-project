package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.MemberRoleAssignRequestDTO;
import com.example.Toastmasters.dto.response.MemberRoleAssignResponseDTO;
import com.example.Toastmasters.entity.MeetingRole;
import com.example.Toastmasters.entity.MemberRoleAssignment;
import com.example.Toastmasters.service.MemberRoleAssignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-assign")
@RequiredArgsConstructor
public class MemberRoleAssignController {

    private final MemberRoleAssignService memberRoleAssignService;

    // Admin assigns a role to a member

    @PostMapping("/assign")
    public ResponseEntity <List<MemberRoleAssignResponseDTO>> assignRole(
            @RequestBody List<MemberRoleAssignRequestDTO> memberRoleAssignRequestDTO) {

        List<MemberRoleAssignResponseDTO> response =
                memberRoleAssignService.assignRole(memberRoleAssignRequestDTO);
        return ResponseEntity.ok(response);
    }

    // Get all assignments for a meeting

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<MemberRoleAssignResponseDTO>> getAssignmentsByMeeting(
            @PathVariable Long meetingId) {

        List<MemberRoleAssignResponseDTO> assignments =
                memberRoleAssignService.getAssignmentsByMeeting(meetingId);
        return ResponseEntity.ok(assignments);
    }

     // Get all assignments for a specific member

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<MemberRoleAssignResponseDTO>> getAssignmentsByMember(
            @PathVariable Long memberId) {

        List<MemberRoleAssignResponseDTO> assignments =
                memberRoleAssignService.getAssignmentsByMember(memberId);
        return ResponseEntity.ok(assignments);
    }
}
