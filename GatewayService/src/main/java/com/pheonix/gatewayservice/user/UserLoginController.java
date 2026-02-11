package com.pheonix.gatewayservice.user;

import com.pheonix.gatewayservice.asset.JWTResponse;
import com.pheonix.gatewayservice.asset.LoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserLoginController {
    private final UserLoginService userLoginService;

    public UserLoginController(UserLoginService userLoginService) {
        this.userLoginService = userLoginService;
    }

    @PostMapping("/create/account")
    public String createAccount(@RequestBody LoginRequest loginRequest){
        return userLoginService.createAccount(loginRequest);
    }

    @PostMapping("/login/account")
    public ResponseEntity<JWTResponse> login(@RequestBody LoginRequest loginRequest){
        return userLoginService.authenticate(loginRequest);
    }
}
