package com.example.Toastmasters.entity;

import com.example.Toastmasters.enums.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;

// import removed

@Entity
@Table(name = "member_availability",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_member_meeting", columnNames = {"mem_id", "meeting_id"})
		}
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberAvailability {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "av_id")
	private Long avId;

	@Column(name = "mem_id", nullable = false)
	private Long memberId;

	@Column(name = "meeting_id", nullable = false)
	private Long meetingId;

	@Enumerated(EnumType.STRING)
	@Column(name = "ava_status", nullable = false)
	private AvailabilityStatus avaStatus;
}


