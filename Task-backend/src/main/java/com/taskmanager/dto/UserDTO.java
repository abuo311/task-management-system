package com.taskmanager.dto;

import com.taskmanager.entities.User;

public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String role; // Changed from Set<String> to String

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.phoneNumber = user.getPhoneNumber();
        
        // Normalize role for the frontend (Ensure it has ROLE_ prefix)
        if (user.getRole() != null) {
            this.role = user.getRole().startsWith("ROLE_") 
                        ? user.getRole() 
                        : "ROLE_" + user.getRole();
        }
    }

    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getRole() { return role; }
}