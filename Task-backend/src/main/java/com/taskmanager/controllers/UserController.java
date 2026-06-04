package com.taskmanager.controllers;

import com.taskmanager.dto.UserDTO;
import com.taskmanager.entities.User;
import com.taskmanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

   @GetMapping
    // Added 'USER' or other roles that need to view data for the board/dashboard
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'USER', 'LABORER')") 
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        String currentUsername = authentication.getName();

        return userRepository.findById(id).map(user -> {
            if (user.getUsername().equals(currentUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You cannot delete your own administrative account.");
            }

            userRepository.delete(user);
            return ResponseEntity.ok("User removed from system.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData, Authentication authentication) {
        String currentUsername = authentication.getName();
        
        return userRepository.findByUsername(currentUsername).map(user -> {
            user.setFullName(profileData.getFullName());
            user.setPhoneNumber(profileData.getPhoneNumber());
            userRepository.save(user);
            return ResponseEntity.ok("Profile updated successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
}