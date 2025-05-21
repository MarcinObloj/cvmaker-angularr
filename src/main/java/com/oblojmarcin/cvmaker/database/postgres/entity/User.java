
package com.oblojmarcin.cvmaker.database.postgres.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(name = "username")
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private Boolean emailVerified;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "token_expiration")
    private LocalDateTime tokenExpiration;

    @ManyToOne
    @JoinColumn(name = "roleId", referencedColumnName = "id")
    private Roles role;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

}

