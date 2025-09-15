package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.LoginRequestDTO;
import com.example.Toastmasters.dto.response.LoginResponseDTO;

public interface LoginService {

    public LoginResponseDTO login(LoginRequestDTO loginRequest) ;

    }
