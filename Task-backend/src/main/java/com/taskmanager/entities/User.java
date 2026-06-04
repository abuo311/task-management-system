package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String fullName;

    private String phoneNumber;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String role;

    // --- ADDED FIELD ---
    @Column(nullable = false)
    private boolean enabled = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null || this.role.trim().isEmpty()) {
            return List.of();
        }
        String cleanRole = this.role.toUpperCase().trim();
        String formattedRole = cleanRole.startsWith("ROLE_") ? cleanRole : "ROLE_" + cleanRole;
        return List.of(new SimpleGrantedAuthority(formattedRole));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // --- UPDATED METHOD ---
    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
}