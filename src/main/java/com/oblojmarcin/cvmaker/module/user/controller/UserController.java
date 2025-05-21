package com.oblojmarcin.cvmaker.module.user.controller;

import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import com.oblojmarcin.cvmaker.module.user.dto.ChangePasswordRequest;
import com.oblojmarcin.cvmaker.module.user.service.UserService;
import com.oblojmarcin.cvmaker.shared.util.ApiConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiConstant.USER_API)
public class UserController {

    private final UserService userService;


    @PostMapping(ApiConstant.USER_REGISTER)
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping(ApiConstant.USER_LOGIN)
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        return userService.loginUser(loginRequest);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable int userId) {
        return userService.getUserById(userId);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserById(@PathVariable int userId) {
        return userService.deleteUserById(userId);
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping(ApiConstant.USER_RESET_PASSWORD)
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
      return userService.resetPassword(request);
    }

    @PostMapping(ApiConstant.USER_CHANGE_PASSWORD)
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return userService.changePassword(request.getToken(), request.getNewPassword());
    }

    @GetMapping(ApiConstant.USER_VERIFY)
    public ResponseEntity<String> verifyUser(@RequestParam("code") String code) {
        return userService.verifyUser(code);
    }
}