package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.MemberAvailability;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberAvailabilityRepository extends JpaRepository<MemberAvailability, Long> {
    List<MemberAvailability> findByMeetingId(Long meetingId);

    List<MemberAvailability> findByMemberId(Long memberId);


    Optional<MemberAvailability> findByMemberIdAndMeetingId(Long memberId, Long meetingId);
}
