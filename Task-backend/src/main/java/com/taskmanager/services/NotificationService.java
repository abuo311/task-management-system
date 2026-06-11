package com.taskmanager.services;

import com.taskmanager.entities.Notification;
import com.taskmanager.entities.Task;
import com.taskmanager.entities.User;
import com.taskmanager.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Standard notification creation
    public void createNotification(String title, String message, User recipient) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRecipient(recipient);
        notificationRepository.save(notification);
    }

    // Task-linked completion notification
    public void createTaskCompletionNotification(Task task, String title, String message, User manager) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);

        // Link the Task
        notification.setTask(task);

        // Link the Recipient (The manager who assigned the task)
        notification.setRecipient(manager);

        // Link the Sender (The laborer)
        if (task.getLaborer() != null) {
            notification.setSender(task.getLaborer());
        }

        notificationRepository.save(notification);
    }
}