package com.pheonix.gatewayservice.message;

import com.pheonix.gatewayservice.repository.UserEntity;
import com.pheonix.gatewayservice.repository.UserRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class KafkaMessagePublisher {
    private final UserRepository userRepository;
    KafkaTemplate<String, String> kafkaTemplate;

    public KafkaMessagePublisher(KafkaTemplate<String, String> kafkaTemplate, UserRepository userRepository){
        this.kafkaTemplate = kafkaTemplate;
        this.userRepository = userRepository;
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
}
