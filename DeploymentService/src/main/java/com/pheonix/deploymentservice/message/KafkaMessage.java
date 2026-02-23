package com.pheonix.deploymentservice.message;

import com.pheonix.deploymentservice.repository.DeploymentEntity;
import com.pheonix.deploymentservice.repository.DeploymentRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class KafkaMessage {
    private final DeploymentRepository deploymentRepository;

    public KafkaMessage(DeploymentRepository deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }

    @KafkaListener(topics = "deployment", groupId = "depGroup")
    public void decisionToDeploy(String message) {
        //message is username,storedurl,true/false;

        String[] messages = message.split(",");
        Optional<DeploymentEntity> deploy = deploymentRepository.findByStoredUrlAndUsername(messages[1], messages[0]);
        deploy.get().setBuilt(messages[2].equals("true"));

        deploymentRepository.save(deploy.get());
    }
}
