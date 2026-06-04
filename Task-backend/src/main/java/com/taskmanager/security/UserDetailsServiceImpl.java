package com.taskmanager.security;

import com.taskmanager.entities.User;
import com.taskmanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Debug logging
        System.out.println("========================================");
        System.out.println("AUTHENTICATION DEBUG");
        System.out.println("Username: " + user.getUsername());
        System.out.println("Database Role: " + user.getRole());
        System.out.println("Enabled: " + user.isEnabled());
        System.out.println("Authorities: " + user.getAuthorities());
        System.out.println("========================================");

        // Validate role
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            throw new UsernameNotFoundException(
                    "User [" + username + "] has no role assigned.");
        }

        return user;
    }
}