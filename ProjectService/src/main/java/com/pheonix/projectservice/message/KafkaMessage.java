package com.pheonix.projectservice.message;

import com.pheonix.projectservice.repository.*;
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
    private final BuildRepository buildRepository;

    public KafkaMessage(KafkaTemplate<String, String> kafkaTemplate, GitFolderRepository gitFolderRepository, GitRepository gitRepository, BuildRepository buildRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.gitFolderRepository = gitFolderRepository;
        this.gitRepository = gitRepository;
        this.buildRepository = buildRepository;
    }

    @KafkaListener(topics = "user-registration", groupId = "projGroup")
    public void ListenUserRegistration(String username) {
        gitRepository.save(new GitEntity(username));
    }

    @Scheduled(fixedDelay = 20_000)
    public void sendPatFailureMessage() {
        int pageSize = 50;
        Page<GitFolderEntity> page;
        int i = 0;
        do {
            Pageable pageable = PageRequest.of(i++, pageSize);
            page = gitFolderRepository.findByPatFailure(true, pageable);

            for (GitFolderEntity folder : page.getContent()) {
                kafkaTemplate.send("pat-failure", folder.getGitEntity().getGitUsername());
                folder.setPatFailure(false);
                gitFolderRepository.save(folder);
            }
        } while (!page.isEmpty());
    }

    @Scheduled(fixedDelay = 20_000)
    public void sendBuildMessage() {
        int pageSize = 50;
        Page<BuildEntity> page;
        int i = 0;

        do {
            Pageable pageable = PageRequest.of(i++, pageSize);
            page = buildRepository.findByBuildMessageSentAndBuildStart(false, true, pageable);

            for (BuildEntity folder : page.getContent()) {
                kafkaTemplate.send("build-notification", folder.getGitFolderEntity().getStoredUrl() + "₹" + folder.getGitFolderEntity().getGitEntity().getUsername());
                folder.setBuildMessageSent(true);
                buildRepository.save(folder);
            }

        } while (!page.isEmpty());
    }
}