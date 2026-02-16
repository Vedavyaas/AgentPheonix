package com.pheonix.projectservice.message;

import com.pheonix.projectservice.repository.GitEntity;
import com.pheonix.projectservice.repository.GitFolderEntity;
import com.pheonix.projectservice.repository.GitFolderRepository;
import com.pheonix.projectservice.repository.GitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class KafkaMessage {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final GitFolderRepository gitFolderRepository;
    private final GitRepository gitRepository;

    public KafkaMessage(KafkaTemplate<String, String> kafkaTemplate, GitFolderRepository gitFolderRepository, GitRepository gitRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.gitFolderRepository = gitFolderRepository;
        this.gitRepository = gitRepository;
    }

    @KafkaListener(topics = "user-registration", groupId = "projGroup")
    public void ListenUserRegistration(String username) {
        gitRepository.save(new GitEntity(username));
    }

    @Scheduled(fixedDelay = 20_000)
    public void sendPatFailureMessage() {
        int pageSize = 50;
        Page<GitFolderEntity> page;

        do {
            Pageable pageable = PageRequest.of(0, pageSize);
            page = gitFolderRepository.findByPatFailure(true, pageable);

            for (GitFolderEntity folder : page.getContent()) {
                kafkaTemplate.send(folder.getGitEntity().getGitUsername(), "pat-failure");
            }

        } while (!page.isEmpty());
    }
}
