package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.LoginRequestDTO;
import com.example.Toastmasters.dto.response.LoginResponseDTO;
import com.example.Toastmasters.service.LoginService;
import com.example.Toastmasters.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private LoginService authService;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO loginRequest) {
        return authService.login(loginRequest);
    }
}
