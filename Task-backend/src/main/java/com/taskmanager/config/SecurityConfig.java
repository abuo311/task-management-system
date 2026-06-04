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
                        // 1. PUBLIC
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. SPECIFIC USER & DASHBOARD ENDPOINTS
                        .requestMatchers("/api/users/profile").authenticated()
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/api/users/stats", "/api/users/dashboard-data").authenticated()

                        // 3. RESTRICTED USER MANAGEMENT
                        .requestMatchers("/api/users/**").hasAnyRole("SYSTEM_ADMIN", "ADMIN")

                        // 4. TASK/LABORER/ATTENDANCE MODIFICATIONS
                        .requestMatchers(HttpMethod.POST, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyRole("SYSTEM_ADMIN", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyRole("SYSTEM_ADMIN", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**")
                        .hasAnyRole("SYSTEM_ADMIN", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/**")
                        .hasAnyRole("SYSTEM_ADMIN", "MANAGER", "ADMIN", "USER")

                        // 5. GENERAL READ ACCESS (GET)
                        .requestMatchers(HttpMethod.GET, "/api/laborers/**", "/api/tasks/**", "/api/attendance/**",
                                "/api/specializations/**")
                        .authenticated()

                        // 6. CATCH-ALL
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Explicit origin set
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}