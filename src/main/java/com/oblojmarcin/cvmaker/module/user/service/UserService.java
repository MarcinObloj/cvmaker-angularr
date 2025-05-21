package com.oblojmarcin.cvmaker.module.user.service;

import com.oblojmarcin.cvmaker.database.postgres.entity.Roles;
import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import com.oblojmarcin.cvmaker.database.postgres.repository.RoleRepository;
import com.oblojmarcin.cvmaker.database.postgres.repository.UserRepository;
import com.oblojmarcin.cvmaker.module.email.service.EmailService;
import com.oblojmarcin.cvmaker.application.security.JwtUtil;
import com.oblojmarcin.cvmaker.shared.util.ApiConstant;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final SpringTemplateEngine templateEngine;

    @Transactional
    public ResponseEntity<Map<String, String>> registerUser(User user) {
        Map<String, String> response = new HashMap<>();
        try {
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                response.put("message", "Email już został użyty do rejestracji.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setVerificationToken(generateVerificationToken());
            user.setTokenExpiration(LocalDateTime.now().plusDays(1));
            user.setEmailVerified(false);
            Roles role = roleRepository.findById(1)
                    .orElseThrow(() -> new Exception("Role not found"));
            user.setRole(role);
            user.setCreatedAt(LocalDateTime.now());

            User registeredUser = userRepository.save(user);

            String baseVerifyUrl = "http://localhost:8080/api/users/verify";
            String verificationUrl = baseVerifyUrl + "?code=" + registeredUser.getVerificationToken();
            emailService.sendVerificationEmail(registeredUser, verificationUrl);

            response.put("message", "Użytkownik zarejestrował się pomyślnie. Token weryfikacyjny został wysłany na Twój adres e-mail.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Wystąpił problem podczas rejestracji: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @Transactional
    public ResponseEntity<String> verifyUser(String token) {
        Optional<User> optionalUser = userRepository.findByVerificationToken(token);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getTokenExpiration() != null && user.getTokenExpiration().isAfter(LocalDateTime.now())) {
                user.setEmailVerified(true);
                user.setVerificationToken(null);
                user.setTokenExpiration(null);
                userRepository.save(user);

                Context context = new Context();

                context.setVariable("loginUrl", ApiConstant.siteURL+"/login");
                String htmlResponse = templateEngine.process("verificationResponse", context);
                return ResponseEntity.ok(htmlResponse);
            }
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Kod weryfikacyjny jest nieprawidłowy lub wygasł.");
    }

    @Transactional
    public ResponseEntity<Void> deleteUserById(int userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<?> loginUser(String emailOrUsername, String password) {
        try {
            Optional<User> optionalUser = userRepository.findByEmailOrUsername(emailOrUsername);
            if (optionalUser.isEmpty()) {
                throw new IllegalArgumentException("Użytkownik nie znaleziony");
            }

            User user = optionalUser.get();
            if (user.getEmailVerified() && passwordEncoder.matches(password, user.getPassword())) {
                String token = jwtUtil.generateToken(user.getUsername());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", user.getUserId());
                response.put("username", user.getUsername());
                response.put("role", user.getRole().getName());
                return ResponseEntity.ok(response);
            } else {
                throw new IllegalArgumentException("Nieprawidłowy email albo hasło");
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
    @Transactional
    public ResponseEntity<?> loginUser(Map<String, String> loginRequest){
        String emailOrUsername = loginRequest.get("emailOrUsername");
        String password = loginRequest.get("password");
        return loginUser(emailOrUsername,password);
    }

    public ResponseEntity<Map<String, String>> resetPassword(String email, String siteURL) {
        Map<String, String> response = new HashMap<>();
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            String resetToken = UUID.randomUUID().toString();
            int updatedRows = userRepository.updateResetPasswordToken(resetToken, email);

            if (updatedRows > 0) {
                User user = optionalUser.get();
                String resetUrl = siteURL + "?token=" + resetToken;
                emailService.sendPasswordResetEmail(user, resetUrl);
                response.put("message", "Na Twój adres e-mail została wysłana wiadomość z instrukcjami dotyczącymi resetowania hasła.");
                return ResponseEntity.ok(response);
            }
        }
        response.put("message", "Nie znaleziono użytkownika o podanym adresie e-mail.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    @Transactional
    public ResponseEntity<Map<String, String>> resetPassword(Map<String, String> request){
        String email =request.get("email");
        return resetPassword(email,ApiConstant.RESET_URL);
    }

    public ResponseEntity<?> changePassword(String token, String newPassword) {
        try {
            Optional<User> optionalUser = userRepository.findByResetPasswordToken(token);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetPasswordToken(null);
                userRepository.save(user);
                return ResponseEntity.ok(Collections.singletonMap("message", "Hasło zostało zmienione pomyślnie."));
            } else {
                throw new Exception("Nieprawidłowy token.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Wystąpił błąd podczas zmiany hasła: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getUserById(int userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving users: " + e.getMessage());
        }
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
}