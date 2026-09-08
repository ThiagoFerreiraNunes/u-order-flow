package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.uorderflow.dto.user.UserPasswordUpdateDTO;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.dto.user.UserUpdateDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;
import org.uorderflow.service.user.UserService;

import java.util.Objects;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAll(
            @RequestParam(required = false) String name,
            @RequestParam(name = "is-deleted", defaultValue = "false") boolean isDeleted,
            @RequestParam(name = "exclude-role", required = false) UserRole excludeRole,
            @PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable,
            Authentication authentication
    ){
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(role -> Objects.equals(role.getAuthority(), "ADMIN"));

        return ResponseEntity.ok(userService.findAll(name, isDeleted, excludeRole, pageable, isAdmin));
    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id, Authentication authentication){
        User loggedUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findById(id, loggedUser));
    }

    @PutMapping("{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @RequestBody @Valid UserUpdateDTO data){
        return ResponseEntity.ok(userService.update(id, data));
    }

    @DeleteMapping("{id}/delete")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}/reactivate")
    public ResponseEntity<UserResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(userService.reactivate(id));
    }

    @PatchMapping("{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Long id,
            @RequestBody @Valid UserPasswordUpdateDTO data,
            Authentication authentication
    ){
        User loggedUser = (User) authentication.getPrincipal();
        userService.updatePassword(id, data, loggedUser);
        return ResponseEntity.noContent().build();
    }
}
