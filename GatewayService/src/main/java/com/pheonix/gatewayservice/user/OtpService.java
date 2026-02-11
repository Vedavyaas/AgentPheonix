package com.pheonix.gatewayservice.user;

import com.pheonix.gatewayservice.repository.OtpEntity;
import com.pheonix.gatewayservice.repository.OtpRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final org.springframework.mail.javamail.JavaMailSender javaMailSender;

    public OtpService(OtpRepository otpRepository, org.springframework.mail.javamail.JavaMailSender javaMailSender) {
        this.otpRepository = otpRepository;
        this.javaMailSender = javaMailSender;
    }

    public void generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        Optional<OtpEntity> existingOtp = otpRepository.findByEmail(email);
        OtpEntity otpEntity;
        
        if (existingOtp.isPresent()) {
            otpEntity = existingOtp.get();
            otpEntity.setOtp(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        } else {
            otpEntity = new OtpEntity(email, otp, LocalDateTime.now().plusMinutes(5));
        }
        
        otpRepository.save(otpEntity);
        sendEmail(email, otp);
    }

    private void sendEmail(String to, String otp) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Your OTP Code");
                message.setText("Your OTP code is: " + otp);
                javaMailSender.send(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public boolean validateOtp(String email, String otp) {
        Optional<OtpEntity> otpEntityOptional = otpRepository.findByEmail(email);
        
        if (otpEntityOptional.isPresent()) {
            OtpEntity otpEntity = otpEntityOptional.get();
            
            if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
                otpRepository.delete(otpEntity);
                return false;
            }
            
            if (otpEntity.getOtp().equals(otp)) {
                otpRepository.delete(otpEntity);
                return true;
            }
        }
        return false;
    }
}
