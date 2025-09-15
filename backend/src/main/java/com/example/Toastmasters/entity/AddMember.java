package com.example.Toastmasters.entity;

import com.example.Toastmasters.enums.Gender;
import com.example.Toastmasters.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class AddMember {

    @Id
    private Long memberId; // Changed from String → Long

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Date dateOfBirth;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, unique = true)
    private Long contact;

    @Column(nullable = false)
    private Date doj;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(nullable = false)
    private String password;

    @Column(name = "mentor_id")
    private Long mentorId;

    private boolean isActive;

}
