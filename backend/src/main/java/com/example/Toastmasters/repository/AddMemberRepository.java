package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.AddMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddMemberRepository extends JpaRepository<AddMember, Long> {

    Optional<AddMember> findTopByOrderByMemberIdDesc();
    Optional<AddMember> findByEmail(String email);

}
