package com.pheonix.deploymentservice.service;

import com.pheonix.deploymentservice.assets.CloudCredentials;
import com.pheonix.deploymentservice.assets.CloudInfrastructure;
import com.pheonix.deploymentservice.repository.DeploymentEntity;
import com.pheonix.deploymentservice.repository.DeploymentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CloudCredentialService {
    private final DeploymentRepository deploymentRepository;

    public CloudCredentialService(DeploymentRepository deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }

    public String makeDeployment(String username, String storedUrl, CloudCredentials cloudCredentials) {
        if (deploymentRepository.existsByStoredUrl(storedUrl)) return "Credentials already exists for this project.";

        DeploymentEntity deploymentEntity = new DeploymentEntity(username, storedUrl, cloudCredentials.cloudInfrastructure(), cloudCredentials.pat(), cloudCredentials.region());
        deploymentRepository.save(deploymentEntity);

        return "Credentials stored";
    }

    public String updatePat(String pat, String storedUrl) {
        Optional<DeploymentEntity> deploymentEntity = deploymentRepository.findByStoredUrl(storedUrl);

        if (deploymentEntity.isEmpty()) return "Credentials doesnt exists.";

        deploymentEntity.get().setPat(pat);
        deploymentRepository.save(deploymentEntity.get());

        return "PAT updated";
    }

    public String updateRegion(String region, String storedUrl) {
        Optional<DeploymentEntity> deploymentEntity = deploymentRepository.findByStoredUrl(storedUrl);

        if (deploymentEntity.isEmpty()) return "Credentials doesnt exists.";

        deploymentEntity.get().setRegion(region);
        deploymentRepository.save(deploymentEntity.get());

        return "Region updated";
    }

    public String updateCloudInfrastructure(CloudInfrastructure cloudInfrastructure, String storedUrl) {
        Optional<DeploymentEntity> deploymentEntity = deploymentRepository.findByStoredUrl(storedUrl);

        if (deploymentEntity.isEmpty()) return "Credentials doesnt exists.";

        deploymentEntity.get().setCloudInfrastructure(cloudInfrastructure);
        deploymentRepository.save(deploymentEntity.get());

        return "Cloud Infrastructure updated";
    }
}