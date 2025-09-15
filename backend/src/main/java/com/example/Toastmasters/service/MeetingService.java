package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.MeetingRequestDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;

import java.util.List;

public interface MeetingService {
    MeetingResponseDTO createMeeting(MeetingRequestDTO requestDTO);
    List<MeetingResponseDTO> getAllMeetings();
    MeetingResponseDTO getMeetingById(Long meetingId);
    MeetingResponseDTO updateMeeting(Long meetingId, MeetingRequestDTO requestDTO);
    void deleteMeeting(Long meetingId);
    }
