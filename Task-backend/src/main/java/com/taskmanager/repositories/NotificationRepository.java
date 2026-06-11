package com.taskmanager.repositories;

import com.taskmanager.entities.Notification;
import com.taskmanager.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}