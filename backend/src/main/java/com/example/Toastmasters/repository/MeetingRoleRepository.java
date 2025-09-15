package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.MeetingRole;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;

public interface MeetingRoleRepository extends JpaRepository<MeetingRole,Long> {
    List<MeetingRole> findByMeetingMeetingId(Long meetingId);
}
