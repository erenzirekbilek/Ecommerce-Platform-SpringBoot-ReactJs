package com.v1.backend.controller;
import com.v1.backend.dto.login.LoginRequest;
import com.v1.backend.dto.signup.SignupRequest;
import com.v1.backend.model.User;
import com.v1.backend.security.JwtUtils;
import com.v1.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils; // <<< bunu ekle

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.registerUser(request);
        return ResponseEntity.ok("User registered: " + user.getUsername());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!userService.matchesPassword(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        // ✅ User objesi ile token oluştur (email değil)
        String token = jwtUtils.generateJwtToken(user);

        return ResponseEntity.ok(token);
    }

    // Bu endpoint JWT doğrulaması yapıyor
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        // Authorization header'dan token al
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(403).body("No token provided");
        }

        String token = authHeader.substring(7); // "Bearer " kısmını çıkar

        // Token'dan username çıkar (JwtUtils senin daha önceki sınıfın)
        String username = userService.extractUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(403).body("Invalid token");
        }

        // Kullanıcıyı bul
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }

    // 🔒 SADECE ADMIN GİREBİLİR
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/panel")
    public ResponseEntity<?> adminPanel(Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Admin değilsin");
        }
        return ResponseEntity.ok("Welcome to ADMIN PANEL");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT stateless olduğu için sunucuda bir şey silmeye gerek yok.
        // Sadece istemciye "işlem başarılı" dönüyoruz.
        return ResponseEntity.ok("Logged out successfully");
    }

}