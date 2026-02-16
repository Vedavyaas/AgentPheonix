package com.pheonix.gatewayservice.message;

import com.pheonix.gatewayservice.repository.UserEntity;
import com.pheonix.gatewayservice.repository.UserRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class KafkaMessagePublisher {
    private final UserRepository userRepository;
    KafkaTemplate<String, String> kafkaTemplate;
    private final JavaMailSender javaMailSender;

    public KafkaMessagePublisher(KafkaTemplate<String, String> kafkaTemplate, UserRepository userRepository, JavaMailSender javaMailSender){
        this.kafkaTemplate = kafkaTemplate;
        this.userRepository = userRepository;
        this.javaMailSender = javaMailSender;
    }

    @Scheduled(fixedDelay = 1_000)
    public void publishEvent(){
        List<UserEntity> user = userRepository.findByPublished(false);

        for (var i : user) {
            kafkaTemplate.send("user-registration", i.getUsername());
            i.setPublished(true);
            userRepository.save(i);
        }
    }

    @KafkaListener(topics = "pat-failure", groupId = "apiGroup")
    public void notify(String username) {
        Optional<UserEntity> user = userRepository.findByUsername(username);

        if (user.isPresent()) {
            sendEmail(user.get().getEmail());
        }
    }
    private void sendEmail(String to) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
                message.setTo(to);
                message.setSubject("PAT Failure");
                message.setText("Your GitHub PAT is either wrong or its expired.");
                javaMailSender.send(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
