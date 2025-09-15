package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.LoginRequestDTO;
import com.example.Toastmasters.dto.response.LoginResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private AddMemberRepository memberRepository;

    // Hardcoded admin credentials
    private static final String ADMIN_EMAIL = "admin@toastmasters.com";
    private static final String ADMIN_PASSWORD = "admin123";

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        // check for admin
        if (ADMIN_EMAIL.equals(loginRequest.getEmail()) && ADMIN_PASSWORD.equals(loginRequest.getPassword())) {
            return new LoginResponseDTO("Login successful", "ADMIN",null);
        }

        // otherwise, check for member in database
        AddMember member = memberRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!member.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new LoginResponseDTO("Login successful", "MEMBER",member.getMemberId());
    }
}
