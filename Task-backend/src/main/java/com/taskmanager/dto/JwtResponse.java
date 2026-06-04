package com.taskmanager.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private String fullName;      // NEW: Added for Task Assigner Display
    private String phoneNumber;   // NEW: Added for Task Contact Display
    private List<String> roles;

    // Updated Constructor for the AuthController
    public JwtResponse(String token, String username, String fullName, String phoneNumber, List<String> roles) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
    }
}