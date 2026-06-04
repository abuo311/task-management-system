package com.taskmanager.repositories;

import com.taskmanager.entities.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByLaborer_Id(Long laborerId);

    // CHANGE THIS: Match your new entity field name 'recordedBy'
    List<AttendanceRecord> findByRecordedBy_Id(Long userId);

    List<AttendanceRecord> findByWorkDate(LocalDate workDate);

    List<AttendanceRecord> findByStatus(AttendanceRecord.AttendanceStatus status);

    // Ensure this uses the underscore as well
    boolean existsByLaborer_IdAndWorkDate(Long laborerId, LocalDate workDate);
}