package com.pheonix.gatewayservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.pheonix.gatewayservice.asset.Role;
import com.pheonix.gatewayservice.repository.UserEntity;
import com.pheonix.gatewayservice.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class Sample implements CommandLineRunner{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public Sample(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Override
    public void run(String... args) throws Exception {
        UserEntity user = new UserEntity();
        user.setUsername("admin");
        user.setPassword(passwordEncoder.encode("admin"));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }
}
