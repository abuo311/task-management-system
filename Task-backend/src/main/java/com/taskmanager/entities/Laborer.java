package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Column(nullable = false)
    private String workCategory;

    @Column(nullable = false)
    private LocalDate hireDate;

    private LocalDate registrationDate;

    @OneToMany(mappedBy = "laborer")
    @JsonIgnoreProperties("laborer")
    private List<Task> tasks;

    // --- Security / UserDetails Methods ---

    @Override
    @JsonIgnore // Added to prevent Jackson from attempting to serialize the interface
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_LABORER"));
    }

    @Override
    @JsonIgnore // Added to prevent Jackson from treating this as a property
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore // Added to prevent Jackson from treating this as a property
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore // Added to prevent Jackson from treating this as a property
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore // Added to prevent Jackson from treating this as a property
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
        if (this.employmentType == EmploymentType.FULL_TIME)
            return false;
        return ChronoUnit.YEARS.between(hireDate, LocalDate.now()) >= 8;
    }

    // --- Enums ---

    public enum EmploymentType {
        CASUAL, FULL_TIME, PART_TIME, CONTRACTOR
    }
}