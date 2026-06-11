package com.taskmanager.config;

import com.taskmanager.security.AuthTokenFilter;
import com.taskmanager.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC ENDPOINTS
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. AUTHENTICATED ENDPOINTS
                        .requestMatchers("/api/tasks/my-tasks", "/api/users/profile", "/api/dashboard/**",
                                "/api/users/stats", "/api/users/dashboard-data")
                        .authenticated()

                        .requestMatchers("/api/tasks/my-tasks/**")
                        .hasAnyAuthority("ROLE_LABORER", "ROLE_SYSTEM_ADMIN", "ROLE_ADMIN", "ROLE_MANAGER")

                        // CHANGE: Use hasAnyAuthority to match the exact string "ROLE_SYSTEM_ADMIN"
                        .requestMatchers("/api/activities/**")
                        .hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_LABORER")

                        // 3. ROLE-BASED ACCESS
                        .requestMatchers("/api/users/**").hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_ADMIN")

                        // 4. TASK/LABORER/ATTENDANCE MODIFICATIONS
                        .requestMatchers(HttpMethod.POST, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_LABORER")

                        .requestMatchers(HttpMethod.PUT, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_LABORER")

                        .requestMatchers(HttpMethod.DELETE, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_LABORER")

                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/**")
                        .hasAnyAuthority("ROLE_SYSTEM_ADMIN", "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_USER", "ROLE_LABORER")

                        // 5. GENERAL READ ACCESS
                        .requestMatchers(HttpMethod.GET, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**",
                                "/api/specializations/**")
                        .authenticated()

                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}