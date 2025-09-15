package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    Meeting findTopByOrderByMeetingIdDesc();

    List<Meeting> findByDateAfter(LocalDate today);


}
