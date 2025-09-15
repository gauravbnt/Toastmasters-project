package com.example.Toastmasters.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;

public enum MeetingType {
    REGULAR,
    CONTEST,
    SPECIAL
    ;

    @JsonCreator(mode = Mode.DELEGATING)
    public static MeetingType fromValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        switch (normalized) {
            case "REGULAR":
                return REGULAR;
            case "CONTEST":
                return CONTEST;
            case "SPECIAL":
                return SPECIAL;
            default:
                throw new IllegalArgumentException("Invalid meetingType: " + value);
        }
    }
    @JsonValue
    public String toValue() {
        return name();
    }
}
