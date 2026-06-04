package com.taskmanager.services;

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

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository repository;

    @Autowired
    private LaborerRepository laborerRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AttendanceRecord> getAllAttendance() {
        return repository.findAll();
    }

    public List<AttendanceRecord> getAttendanceByLaborer(Long userId) {
        return repository.findByRecordedBy_Id(userId);
    }

    @Transactional
    public AttendanceRecord save(AttendanceRecord record) {
        // 1. Resolve Laborer
        Long lId = (record.getLaborer() != null) ? record.getLaborer().getId() : record.getLaborerId();
        Laborer laborer = laborerRepository.findById(lId)
                .orElseThrow(() -> new RuntimeException("Laborer not found with ID: " + lId));
        record.setLaborer(laborer);

        // 2. Prevent duplicate attendance for the same day
        LocalDate date = (record.getWorkDate() != null) ? record.getWorkDate() : LocalDate.now();
        if (repository.existsByLaborer_IdAndWorkDate(lId, date)) {
            throw new RuntimeException("Attendance for this laborer has already been recorded for " + date);
        }

        // 3. Payroll Rules: Weekday vs Weekend
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

        // 4. Automatically assign the logged-in User as the recorder
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found in system"));
        record.setRecordedBy(currentUser);

        // 5. Ensure overtimeHours is not null
        if (record.getOvertimeHours() == null) {
            record.setOvertimeHours(0);
        }

        record.setWorkDate(date);
        return repository.save(record);
    }

    @Transactional
    public AttendanceRecord approveAttendance(Long recordId, User foreman) {
        AttendanceRecord record = repository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        record.setStatus(AttendanceRecord.AttendanceStatus.APPROVED);
        record.setRecordedBy(foreman); // Reflecting updated naming convention
        return repository.save(record);
    }
}