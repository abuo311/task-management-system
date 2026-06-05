package com.taskmanager.controllers;

import com.taskmanager.dto.JwtResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.entities.Laborer;
import com.taskmanager.entities.User;
import com.taskmanager.repositories.LaborerRepository;
import com.taskmanager.repositories.UserRepository;
import com.taskmanager.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LaborerRepository laborerRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Use UserDetails to safely handle both User and Laborer entities
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String fullName = "Unknown";
        String phone = "N/A";

        // Polymorphic check to extract profile details correctly
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            fullName = user.getFullName();
            phone = user.getPhoneNumber();
        } else if (userDetails instanceof Laborer) {
            Laborer laborer = (Laborer) userDetails;
            fullName = laborer.getName();
            phone = laborer.getContactNumber();
        }

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getUsername(),
                fullName,
                phone,
                roles));
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {

        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setFullName(signUpRequest.getFullName());
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        String rawRole = signUpRequest.getRole() != null ? signUpRequest.getRole().toUpperCase() : "USER";
        String finalRole = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;
        user.setRole(finalRole);

        userRepository.save(user);

        if ("ROLE_USER".equals(user.getRole())) {
            Laborer laborer = new Laborer();
            laborer.setUsername(user.getUsername());
            laborer.setName(user.getFullName());
            laborer.setContactNumber(user.getPhoneNumber());
            laborer.setTrade("General");
            // Note: Ensure you set default values for mandatory fields like workCategory
            // if your database constraints require them.

            laborerRepository.save(laborer);
        }

        return ResponseEntity.ok("User '" + signUpRequest.getUsername() + "' provisioned successfully!");
    }
}