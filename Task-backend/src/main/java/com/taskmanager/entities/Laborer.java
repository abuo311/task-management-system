
package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "laborers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Laborer implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("username")
    @Column(nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String contactNumber;
    private String trade;

    @Enumerated(EnumType.STRING) // Still an Enum
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Column(nullable = false)
    private String workCategory; // Changed to String

    @Column(nullable = false)
    private LocalDate hireDate;

    private LocalDate registrationDate;

    @OneToMany(mappedBy = "laborer")
    @JsonIgnoreProperties("laborer")
    private List<Task> tasks;

    // --- Security / UserDetails Methods ---
    // --- Security / UserDetails Methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Assign the LABORER role to this entity
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_LABORER"));
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

    @Override
    public boolean isEnabled() {
        return true;
    }

    // --- Lifecycle and Business Logic ---

    @PrePersist
    protected void onCreate() {
        this.registrationDate = LocalDate.now();
        if (this.hireDate == null) {
            this.hireDate = LocalDate.now();
        }
    }

    public boolean isEligibleForPromotion() {
        if (this.hireDate == null)
            return false;
        // employmentType is still an Enum, so this remains safe
        if (this.employmentType == EmploymentType.FULL_TIME)
            return false;
        return ChronoUnit.YEARS.between(hireDate, LocalDate.now()) >= 8;
    }

    // --- Enums ---

    public enum EmploymentType {
        CASUAL, FULL_TIME, PART_TIME, CONTRACTOR
    }

    // Note: WorkCategory enum was removed
}