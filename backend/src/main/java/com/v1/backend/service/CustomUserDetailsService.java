package com.v1.backend.service;

import com.v1.backend.model.User;
import com.v1.backend.repository.UserRepository;
import com.v1.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        // ✅ Username parametre adı "username" ama aslında EMAIL gönderiliyor!
        // JwtUtils.extractUsername() → email döndürüyor
        // JwtAuthFilter.loadUserByUsername(email) → email gönderiliyor

        User user = userRepository.findByEmail(username)
                .orElseGet(() -> {
                    // Fallback: username'e göre ara (eski sistemler için)
                    return userRepository.findByUsername(username)
                            .orElseThrow(() ->
                                    new UsernameNotFoundException("User not found: " + username));
                });

        // ✅ CustomUserDetails kullan (daha iyi)
        return new CustomUserDetails(user);

        // ❌ VEYA eğer Spring default User kullanmak istersen:
        // return org.springframework.security.core.userdetails.User
        //         .withUsername(user.getEmail())  // ← EMAIL döndür, username değil!
        //         .password(user.getPassword())
        //         .authorities("ROLE_" + user.getRole().name())
        //         .build();
    }
}