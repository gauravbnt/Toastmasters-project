package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.AddMemberRequestDTO;
import com.example.Toastmasters.dto.response.AddMemberResponseDTO;

import java.util.List;

public interface AddMemberService {

    AddMemberResponseDTO addMember(AddMemberRequestDTO dto);

    AddMemberResponseDTO getMemberById(Long memberId);

    List<AddMemberResponseDTO> getAllMembers();

    AddMemberResponseDTO updateMember(Long memberId, AddMemberRequestDTO dto);

    void deleteMemberById(Long memberId);
}
