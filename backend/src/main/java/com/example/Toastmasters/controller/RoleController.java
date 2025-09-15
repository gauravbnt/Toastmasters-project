package com.example.Toastmasters.controller;

import com.example.Toastmasters.dto.request.RoleRequestDTO;
import com.example.Toastmasters.dto.response.RoleResponseDTO;
import com.example.Toastmasters.service.RoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/roles")
public class RoleController {

    private RoleService roleService;

    public RoleController(RoleService roleService){
        this.roleService=roleService;
    }

    @PostMapping("/add")
    public RoleResponseDTO addRole(@RequestBody RoleRequestDTO dto) {
        return roleService.addRole(dto);
    }

    @GetMapping("/{id}")
    public RoleResponseDTO getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id);
    }

    @GetMapping("/all")
    public List<RoleResponseDTO> getAllRoles() {
        return roleService.getAllRoles();
    }

    @PutMapping("/{id}")
    public RoleResponseDTO updateRole(@PathVariable Long id, @RequestBody RoleRequestDTO dto) {
        return roleService.updateRole(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Long id) {
        return roleService.deleteRole(id);
    }
}
