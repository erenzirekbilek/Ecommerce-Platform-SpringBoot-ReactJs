package com.v1.backend.config;

import com.v1.backend.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableMethodSecurity
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 🔓 Public endpoints - Swagger/OpenAPI
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-ui",
                                "/swagger-config",
                                "/webjars/**"
                        ).permitAll()

                        // 📊 Monitoring - Prometheus Actuator (Buraya Ekle)
                        .requestMatchers("/actuator/**").permitAll()

                        // 🔓 Public Auth endpoints
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/signup"
                        ).permitAll()

                        // 🔓 Public Product/Category endpoints
                        .requestMatchers(
                                "/uploads/**",
                                "/api/v1/categories/**",
                                "/api/v1/products/**",
                                "/api/v1/brands/**"
                        ).permitAll()

                        // 🔒 ADMIN only
                        .requestMatchers("/api/auth/admin/**")
                        .hasRole("ADMIN")

                        // 🔐 CART - Requires authentication
                        .requestMatchers(
                                "/api/v1/cart/**",
                                        "/api/v1/orders/**"
                        ).authenticated()

                        // 🔐 Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized - Token gerekli\"}");
                        })
                        .accessDeniedHandler((request, response, e) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Forbidden - Erişim reddedildi\"}");
                        })
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}