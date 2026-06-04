package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Entity
@Table(name = "laborers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Laborer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String name;

    private String contactNumber;

    // e.g., "Washroom", "Grounds", "Sanitation"
    private String trade;

    // --- NEW FIELDS FOR USTED REQUIREMENTS ---

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType; // CASUAL or FULL_TIME

    @Column(nullable = false)
    private String workCategory;

    @Column(nullable = false)
    private LocalDate hireDate; // Needed to track the 7-8 year promotion rule

    // ------------------------------------------

    private LocalDate registrationDate;

    @PrePersist
    protected void onCreate() {
        this.registrationDate = LocalDate.now();
        if (this.hireDate == null) {
            this.hireDate = LocalDate.now();
        }
    }

    public boolean isEligibleForPromotion() {
        // 1. If hireDate is null, they cannot be eligible
        if (this.hireDate == null) {
            return false;
        }

        // 2. Already FULL_TIME, not eligible
        if (this.employmentType == EmploymentType.FULL_TIME) {
            return false;
        }

        // 3. Perform calculation safely
        long yearsOfService = ChronoUnit.YEARS.between(hireDate, LocalDate.now());
        return yearsOfService >= 8;
    }

    @OneToMany(mappedBy = "laborer")
    @JsonIgnoreProperties("laborer")
    private List<Task> tasks;

    // Helper Enums
    public enum EmploymentType {
        CASUAL, FULL_TIME, PART_TIME, CONTRACTOR
    }

    public enum WorkCategory {
        CONSERVANCY, CLEANERS, GROUNDS, GROUNDS_AND_GARDEN, SANITATION
    }
}