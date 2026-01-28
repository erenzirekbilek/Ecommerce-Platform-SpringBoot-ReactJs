package com.v1.backend.model;

import com.v1.backend.validation.EmailDomain;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @EmailDomain(allowed = {"gmail.com", "hotmail.com"})
    @Column(unique = true, nullable = false)
    private String email;

    // 👇 ROLE EKLENDİ
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
