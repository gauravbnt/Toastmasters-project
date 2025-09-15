package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.AddMemberRequestDTO;
import com.example.Toastmasters.dto.response.AddMemberResponseDTO;
import com.example.Toastmasters.service.AddMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/members")
public class AddMemberController {

    private final AddMemberService memberService;

    public AddMemberController(AddMemberService memberService){
        this.memberService = memberService;
    }

    @PostMapping("/add")
    public ResponseEntity<AddMemberResponseDTO> addMember(@RequestBody AddMemberRequestDTO dto) {
        return ResponseEntity.ok(memberService.addMember(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddMemberResponseDTO> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AddMemberResponseDTO>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddMemberResponseDTO> updateMember(@PathVariable Long id, @RequestBody AddMemberRequestDTO dto) {
        return ResponseEntity.ok(memberService.updateMember(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMemberById(@PathVariable Long id) {
        memberService.deleteMemberById(id);
        return ResponseEntity.ok("Member deleted successfully");
    }
}
