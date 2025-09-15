package com.example.Toastmasters.entity;

import com.example.Toastmasters.enums.MeetingType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meeting")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Meeting {

    @Id
    @Column(name = "meeting_id", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // <- auto-increment
    private Long meetingId; // M001, M002

    @Column(name = "meeting_theme", nullable = true, length = 100)
    private String meetingTheme;

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false, length = 20)
    private MeetingType meetingType;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 255)
    private String location;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingRole> meetingRoles = new ArrayList<>();

}
