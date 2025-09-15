package com.example.Toastmasters.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_preference")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="member_id", nullable=false)
    private Long memberId;

    @Column(name="meeting_id", nullable=false)
    private Long meetingId;

    @Column(name="role_id", nullable=false)
    private Long roleId;

    @Column(name = "pref_order")
    private int prefOrder;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
