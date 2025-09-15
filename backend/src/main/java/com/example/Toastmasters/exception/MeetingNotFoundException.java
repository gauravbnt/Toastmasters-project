package com.example.Toastmasters.exception;

public class MeetingNotFoundException extends RuntimeException {
    public MeetingNotFoundException(String meetingId) {
        super("Meeting not found with ID: " + meetingId);
    }
}
