package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.AssignRolesHelperDTO;
import com.example.Toastmasters.dto.request.MemberRoleAssignRequestDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.MemberAvailability;
import com.example.Toastmasters.entity.RolePreference;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.repository.MemberAvailabilityRepository;
import com.example.Toastmasters.repository.RolePreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class AssignRolesHelperServiceImpl {

   private final AddMemberRepository memberRepository;
    private final RolePreferenceRepository rolePreferenceRepository;
    private final MemberAvailabilityRepository memberAvailabilityRepository;

    public AssignRolesHelperServiceImpl(AddMemberRepository memberRepository, RolePreferenceRepository rolePreferenceRepository, MemberAvailabilityRepository memberAvailabilityRepository) {
        this.memberRepository = memberRepository;
        this.rolePreferenceRepository = rolePreferenceRepository;
        this.memberAvailabilityRepository = memberAvailabilityRepository;
    }

    public List<AssignRolesHelperDTO> getData(Long meetingId){

        List<MemberAvailability> availabilityList =memberAvailabilityRepository.findAllByMeetingId(meetingId);
        List<AssignRolesHelperDTO> assignRolesHelperDTOList=new ArrayList<>();
        for(MemberAvailability ma: availabilityList){
            AddMember member = memberRepository.findById(ma.getMemberId()).get();
            AssignRolesHelperDTO assignRolesHelperDTO = new AssignRolesHelperDTO();
            assignRolesHelperDTO.setId(member.getMemberId());
            assignRolesHelperDTO.setName(member.getName());

            List<RolePreference> rolePreferenceList= rolePreferenceRepository.findAllByMemberIdAndMeetingId(member.getMemberId(),meetingId);
            assignRolesHelperDTO.setPref_roles(rolePreferenceList);
            assignRolesHelperDTOList.add(assignRolesHelperDTO);
        }

        return assignRolesHelperDTOList;
    }
}
