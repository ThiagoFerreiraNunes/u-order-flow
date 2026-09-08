package org.uorderflow.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;
import org.uorderflow.service.user.UserService;

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
                .anyMatch(role -> role.getAuthority().equals("ADMIN"));

        return ResponseEntity.ok(userService.findAll(name, isDeleted, excludeRole, pageable, isAdmin));
    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id, Authentication authentication){
        User loggedUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findById(id, loggedUser));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}")
    public ResponseEntity<UserResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(userService.reactivate(id));
    }
}
