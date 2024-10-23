package com.example.forksup.config;


import com.example.forksup.filter.FirebaseAuthenticationFilter;
import org.junit.jupiter.api.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private FirebaseAuthenticationFilter firebaseTokenFilter;

    @Bean
    @Order(1)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/**", "/api/recipes/**", "/api/user/**").permitAll()
                        .requestMatchers("/api/public/**").hasRole("USER")
                        .requestMatchers("/api/private/**").hasRole("VERIFIED")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable())
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .xssProtection(xss -> xss.disable())
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; frame-ancestors 'none';"))
                );

        return http.build();
    }
}