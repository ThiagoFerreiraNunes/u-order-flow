package org.uorderflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.service.user.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAll(@PageableDefault(page = 0, size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable){
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(userService.findById(id));
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
