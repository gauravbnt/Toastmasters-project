package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.AddMemberRequestDTO;
import com.example.Toastmasters.dto.response.AddMemberResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.exception.DuplicateMemberIdException;
import com.example.Toastmasters.exception.MemberNotFoundException;
import com.example.Toastmasters.exception.MentorNotFoundException;
import com.example.Toastmasters.mapper.AddMemberMapper;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.service.AddMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddMemberServiceImpl implements AddMemberService {

    private final AddMemberRepository memberRepository;
    private final AddMemberMapper mapper;

    @Override
    public AddMemberResponseDTO addMember(AddMemberRequestDTO dto) {
        log.info("Adding new member: {}", dto.getName());
        AddMember member = mapper.toEntity(dto);

        // Generate unique 7-digit memberId
        member.setMemberId(generateUniqueMemberId());

        // Only check mentor if mentorId is provided
        if (dto.getMentorId() != null) {
            memberRepository.findById(dto.getMentorId())
                    .orElseThrow(() -> new MentorNotFoundException("Mentor not found with ID: " + dto.getMentorId()));
            member.setMentorId(dto.getMentorId());
        }

        try {
            memberRepository.save(member);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateMemberIdException("A member already exists");
        }

        return mapper.toResponseDTO(member);
    }

    private Long generateUniqueMemberId() {
        long id;
        do {
            id = ThreadLocalRandom.current().nextLong(1_000_000L, 10_000_000L);
        } while (memberRepository.existsById(id));
        return id;
    }

    @Override
    public AddMemberResponseDTO getMemberById(Long memberId) {
        log.info("Fetching member by ID: {}", memberId);
        return memberRepository.findById(memberId)
                .map(mapper::toResponseDTO)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with ID: " + memberId));
    }

    @Override
    public List<AddMemberResponseDTO> getAllMembers() {
        log.info("Fetching all active members");
        return memberRepository.findAll()
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Override
    public AddMemberResponseDTO updateMember(Long memberId, AddMemberRequestDTO dto) {
        log.info("Updating member ID: {}", memberId);
        AddMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Member not found with ID: " + memberId));

        member.setName(dto.getName());
        member.setDateOfBirth(dto.getDateOfBirth());
        member.setEmail(dto.getEmail());
        member.setAddress(dto.getAddress());
        member.setContact(dto.getContact());
        if (dto.getDoj() != null) {
            member.setDoj(dto.getDoj());
        }
        member.setGender(dto.getGender());
        member.setActive(dto.isActive());
        // 👇 Don't touch password if not provided
        if (dto.getPassword() != null) {
            member.setPassword(dto.getPassword());
        }

        if (dto.getMentorId() != null) {
            memberRepository.findById(dto.getMentorId())
                    .orElseThrow(() -> new MentorNotFoundException("Mentor not found with ID: " + dto.getMentorId()));
            member.setMentorId(dto.getMentorId());
        } else {
            member.setMentorId(null);
        }

        memberRepository.save(member);
        return mapper.toResponseDTO(member);
    }

    @Override
    public void deleteMemberById(Long memberId) {
        log.info("Deleting member ID: {}", memberId);
        if (!memberRepository.existsById(memberId)) {
            throw new MemberNotFoundException("Member not found with ID: " + memberId);
        }
        memberRepository.deleteById(memberId);
    }
}
