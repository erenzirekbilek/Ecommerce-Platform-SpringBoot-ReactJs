package com.v1.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String jwtToken = null;
        String email = null;

        log.info("🔍 JWT Filter çalışıyor - Path: {}", request.getRequestURI());
        log.info("📋 Authorization Header: {}", authHeader != null ? "VAR" : "YOK");

        try {
            // 1. Header kontrol et
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("⚠️ Authorization header yok veya format yanlış");
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Token'ı çıkar
            jwtToken = authHeader.substring(7);
            log.info("✅ Token bulundu, uzunluğu: {} karakter", jwtToken.length());

            // 3. Email'i çöz (BURASI HATAYı FIRLATABİLİR)
            try {
                email = jwtUtils.extractUsername(jwtToken);
                log.info("✅ Email çözüldü: {}", email);
            } catch (ExpiredJwtException e) {
                log.error("❌ TOKEN EXPIRED: {}", e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (SignatureException e) {
                log.error("❌ INVALID SIGNATURE: {}", e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (MalformedJwtException e) {
                log.error("❌ MALFORMED TOKEN: {}", e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
                log.error("❌ TOKEN PARSING ERROR: {}", e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }

            // 4. Email boş mı kontrol et
            if (email == null || email.isEmpty()) {
                log.warn("⚠️ Email çözemedi");
                filterChain.doFilter(request, response);
                return;
            }

            // 5. Zaten authentication set edilmişse skip et
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.info("ℹ️ Authentication zaten set edilmiş");
                filterChain.doFilter(request, response);
                return;
            }

            // 6. UserDetails'ı yükle
            UserDetails userDetails = null;
            try {
                userDetails = userDetailsService.loadUserByUsername(email);
                log.info("✅ UserDetails yüklendi: {}", userDetails.getUsername());
            } catch (Exception e) {
                log.error("❌ USER NOT FOUND: {} - Error: {}", email, e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }

            // 7. Token'ı doğrula
            if (jwtUtils.isTokenValid(jwtToken, userDetails)) {
                log.info("✅ Token GEÇERLI!");

                // 8. Authentication token oluştur
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 9. SecurityContext'e set et
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("✅ Authentication set: {}", userDetails.getAuthorities());
            } else {
                log.warn("❌ Token GEÇERSİZ! Email: {}", email);
            }

        } catch (Exception e) {
            log.error("❌ JWT Filter GENEL HATASI: {}", e.getMessage(), e);
        }

        // Her durumda filterChain'i devam ettir
        filterChain.doFilter(request, response);
    }
}