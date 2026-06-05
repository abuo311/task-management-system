package com.taskmanager.security;

import com.taskmanager.entities.User;
import com.taskmanager.entities.Laborer; // Ensure this import is correct
import com.taskmanager.repositories.UserRepository;
import com.taskmanager.repositories.LaborerRepository; // Ensure this import is correct
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LaborerRepository laborerRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Try to find as a standard User (Admin/Manager)
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            logUserDebug(user.getUsername(), user.getRole(), "User/Admin");
            validateRole(user.getRole(), username);
            return user;
        }

        // 2. If not a User, try to find as a Laborer
        Laborer laborer = laborerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        logUserDebug(laborer.getUsername(), "LABORER", "Laborer");

        // Return the Laborer (ensure Laborer entity implements UserDetails)
        return laborer;
    }

    private void logUserDebug(String username, String role, String type) {
        System.out.println("========================================");
        System.out.println("AUTHENTICATION DEBUG (" + type + ")");
        System.out.println("Username: " + username);
        System.out.println("Role: " + role);
        System.out.println("========================================");
    }

    private void validateRole(String role, String username) {
        if (role == null || role.trim().isEmpty()) {
            throw new UsernameNotFoundException("User [" + username + "] has no role assigned.");
        }
    }
}