package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AvailabilitySummaryDTO {
    private long AVAILABLE;
    private long UNAVAILABLE;
    private long MAYBE;
    private long PENDING;
}


