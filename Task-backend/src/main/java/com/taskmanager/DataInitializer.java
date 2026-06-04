package com.taskmanager;

import com.taskmanager.entities.User;
import com.taskmanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if the database is already initialized
        if (userRepository.count() > 0) {
            System.out.println(">>> Data already exists. Skipping initialization.");
            return;
        }

        System.out.println(">>> Database empty. Starting initial seed...");

        // 1. Create SYSTEM ADMIN
        User systemAdmin = new User();
        systemAdmin.setUsername("admin");
        systemAdmin.setFullName("System Admin");
        systemAdmin.setPassword(passwordEncoder.encode("admin123"));
        systemAdmin.setRole("ROLE_SYSTEM_ADMIN");
        userRepository.save(systemAdmin);

        // 2. Create MANAGER
        User manager = new User();
        manager.setUsername("manager");
        manager.setFullName("Operational Manager");
        manager.setPassword(passwordEncoder.encode("manager123"));
        manager.setRole("ROLE_MANAGER");
        userRepository.save(manager);

        // 3. Create PRINCE
        User prince = new User();
        prince.setUsername("Prince");
        prince.setFullName("Adjei Mensah Prince");
        prince.setPhoneNumber("0240000000");
        prince.setPassword(passwordEncoder.encode("prince123"));
        prince.setRole("ROLE_USER");
        userRepository.save(prince);

        System.out.println(">>> Data Initialization Complete. System Ready.");
    }
}