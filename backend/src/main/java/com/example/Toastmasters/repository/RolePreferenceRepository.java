package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.RolePreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePreferenceRepository extends JpaRepository<RolePreference, Long> {
    List<RolePreference> findByMeetingIdAndMemberIdOrderByPrefOrderAsc(Long meetingId, Long memberId);
    void deleteByMeetingIdAndMemberId(Long meetingId, Long memberId);
    Optional<RolePreference> findTopByMemberIdAndMeetingIdOrderByCreatedAtAsc(Long memberId, Long meetingId);

    List<RolePreference> findByMeetingId(Long meetingId);
}
