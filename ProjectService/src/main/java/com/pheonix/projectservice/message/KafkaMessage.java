package com.pheonix.projectservice.message;

import com.pheonix.projectservice.repository.GitEntity;
import com.pheonix.projectservice.repository.GitRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaMessage {
    private final GitRepository gitRepository;

    public KafkaMessage(GitRepository gitRepository) {
        this.gitRepository = gitRepository;
    }

    @KafkaListener(topics = "user-registration", groupId = "projGroup")
    public void ListenUserRegistration(String username) {
        gitRepository.save(new GitEntity(username));
    }
}
