package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.AssignRolesHelperDTO;
import com.example.Toastmasters.service.impl.AssignRolesHelperServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/assign")
public class AssignRolesHelperController {

    private final  AssignRolesHelperServiceImpl assignRolesHelperService;

    public AssignRolesHelperController(AssignRolesHelperServiceImpl assignRolesHelperService) {
        this.assignRolesHelperService = assignRolesHelperService;
    }

    @GetMapping("/get/{meetingId}")
    List<AssignRolesHelperDTO> getData(@PathVariable Long meetingId){
        return assignRolesHelperService.getData(meetingId);
    }
}
