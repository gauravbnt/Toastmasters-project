package com.example.Toastmasters.entity;

import com.example.Toastmasters.repository.MeetingRoleRepository;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_role_assignment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MemberRoleAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="meeting_id", nullable=false)
    private Long meetingId;

    @Column(name="member_id", nullable=false)
    private Long memberId;

    @Column(name="role_id", nullable=false)
    private Long roleId;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
