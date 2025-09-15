package com.example.Toastmasters.exception;

public class MeetingAlreadyExistsException extends RuntimeException {
    public MeetingAlreadyExistsException(String meetingId) {
        super("Meeting already exists with ID: " + meetingId);
    }
}
