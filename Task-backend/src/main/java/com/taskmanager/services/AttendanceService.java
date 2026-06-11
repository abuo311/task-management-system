package com.taskmanager.services;

import com.taskmanager.dto.AttendanceRecordDTO; // Make sure to import your DTO
import com.taskmanager.entities.AttendanceRecord;
import com.taskmanager.entities.Laborer;
import com.taskmanager.entities.User;
import com.taskmanager.repositories.AttendanceRepository;
import com.taskmanager.repositories.LaborerRepository;
import com.taskmanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository repository;

    @Autowired
    private LaborerRepository laborerRepository;

    @Autowired
    private UserRepository userRepository;

    public AttendanceRecordDTO convertToDto(AttendanceRecord record) {
        if (record == null)
            return null;

        AttendanceRecordDTO dto = new AttendanceRecordDTO();
        dto.setId(record.getId());
        dto.setCompletedCoreShift(record.isCompletedCoreShift());
        dto.setOvertimeHours(record.getOvertimeHours());
        dto.setSignedAt(record.getSignedAt());
        dto.setStatus(record.getStatus() != null ? record.getStatus().name() : null);
        dto.setWorkDate(record.getWorkDate());
        dto.setWorkedOvertime(record.isWorkedOvertime());

        // FIX: Access the ID through the recordedBy (foreman) object
        if (record.getRecordedBy() != null) {
            dto.setForemanId(record.getRecordedBy().getId());
        }

        if (record.getLaborer() != null) {
            dto.setLaborerId(record.getLaborer().getId());
            dto.setLaborerName(record.getLaborer().getName());
        } else {
            dto.setLaborerId(record.getLaborerId());
        }

        return dto;
    }

    // --- UPDATED METHOD ---
    @Transactional(readOnly = true)
    public List<AttendanceRecordDTO> getAllAttendance() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Keep other methods as they are...

    @Transactional
    public AttendanceRecord save(AttendanceRecord record) {
        // 1. Resolve Laborer
        Long lId = (record.getLaborer() != null) ? record.getLaborer().getId() : record.getLaborerId();
        Laborer laborer = laborerRepository.findById(lId)
                .orElseThrow(() -> new RuntimeException("Laborer not found with ID: " + lId));
        record.setLaborer(laborer);

        // 2. Default to today if date is null
        LocalDate date = (record.getWorkDate() != null) ? record.getWorkDate() : LocalDate.now();
        record.setWorkDate(date);

        // 3. RULE: Prevent duplicate attendance for the same day
        if (repository.existsByLaborer_IdAndWorkDate(lId, date)) {
            throw new RuntimeException("Attendance for this laborer has already been recorded for " + date);
        }

        // 4. RULE: Weekend validation
        // Casual and Part-Time are eligible for weekends. Full-Time is not.
        DayOfWeek day = date.getDayOfWeek();
        boolean isWeekend = (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY);

        if (isWeekend) {
            boolean isEligibleForWeekend = (laborer.getEmploymentType() == Laborer.EmploymentType.CASUAL ||
                    laborer.getEmploymentType() == Laborer.EmploymentType.PART_TIME);

            if (!isEligibleForWeekend) {
                throw new RuntimeException(
                        "Only Casual or Part-Time workers can have attendance recorded on weekends.");
            }
        }

        // 5. Automatically assign the logged-in User as the recorder
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found in system"));
        record.setRecordedBy(currentUser);

        // 6. Ensure overtimeHours is not null
        if (record.getOvertimeHours() == null) {
            record.setOvertimeHours(0);
        }

        return repository.save(record);
    }
}