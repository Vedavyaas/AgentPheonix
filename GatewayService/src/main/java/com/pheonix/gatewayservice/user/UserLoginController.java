package com.pheonix.gatewayservice.user;

import com.pheonix.gatewayservice.asset.JWTResponse;
import com.pheonix.gatewayservice.asset.LoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserLoginController {
    private final UserLoginService userLoginService;
    private final OtpService otpService;

    public UserLoginController(UserLoginService userLoginService, OtpService otpService) {
        this.userLoginService = userLoginService;
        this.otpService = otpService;
    }

    @PostMapping("/create/account")
    public String createAccount(@RequestBody LoginRequest loginRequest, @RequestParam String otp){
        if (otpService.validateOtp(loginRequest.email(), otp)) {
            return userLoginService.createAccount(loginRequest);
        }

        return "Invalid OTP or expired";
    }

    @PostMapping("/login/account")
    public ResponseEntity<JWTResponse> login(@RequestBody LoginRequest loginRequest){
        return userLoginService.authenticate(loginRequest);
    }

    @PostMapping("/generate-otp")
    public String generateOtp(@RequestParam String email) {
        otpService.generateOtp(email);
        return "OTP sent to " + email;
    }

    @PutMapping("/reset/password")
    public String resetPassword(@RequestParam String email, @RequestParam String newPassword, @RequestParam String otp) {
        if (otpService.validateOtp(email, otp)) {
            return userLoginService.resetPassword(email, newPassword);
        }

        return "Invalid OTP or expired";
    }
}
