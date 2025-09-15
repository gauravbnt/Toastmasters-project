package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.MemberRoleAssignment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MemberRoleAssignmentRepository extends JpaRepository<MemberRoleAssignment, Long> {
    List<MemberRoleAssignment> findByMeetingId(Long meetingId);

    List<MemberRoleAssignment> findByMemberId(Long memberId);

    @Transactional
    void deleteAllByMeetingId(Long meetingId);
}
