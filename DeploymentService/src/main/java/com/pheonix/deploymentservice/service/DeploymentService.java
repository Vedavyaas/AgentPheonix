package com.pheonix.deploymentservice.service;

import com.pheonix.deploymentservice.assets.DeployStage;
import com.pheonix.deploymentservice.repository.DeploymentEntity;
import com.pheonix.deploymentservice.repository.DeploymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeploymentService {
    private final DeploymentRepository deploymentRepository;

    public DeploymentService(DeploymentRepository deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }

    public String deployProject(String username, String storedUrl) {
        Optional<DeploymentEntity> project = deploymentRepository.findByStoredUrlAndUsername(storedUrl, username);

        if (project.isEmpty()) return "Project doesn't exists.";

        if (!project.get().isBuilt()) return "Project is not built yet. Wait or tap build";

        if (!project.get().isDeploy().equals(DeployStage.NOT_STARTED)) return "Project already in deployment progress";

        project.get().setDeploy(DeployStage.PENDING);
        deploymentRepository.save(project.get());

        return "Project is set to deployment.";
    }

    @Scheduled(fixedDelay = 10_000)
    public void findProjectsToDeploy() {
        int pageSize = 50;
        Page<DeploymentEntity> folderPage;

        do {
            Pageable pageable = PageRequest.of(0, pageSize);
            folderPage = deploymentRepository.findByDeployAndBuilt(DeployStage.PENDING, true, pageable);

            for (DeploymentEntity folder : folderPage.getContent()) {
                deploy(folder);
                folder.setDeploy(DeployStage.MAY_FAIL_STAGE);
                deploymentRepository.save(folder);
            }
        } while (folderPage.hasNext());
    }

    @Async
    public void deploy(DeploymentEntity folder) {

    }
}
