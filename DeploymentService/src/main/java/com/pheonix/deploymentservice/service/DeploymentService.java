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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

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
        try {
            String localPath = folder.getStoredUrl();
            String pat = folder.getPat();

            ProcessBuilder pb = new ProcessBuilder(
                    "/opt/homebrew/bin/vercel",
                    "--cwd", localPath,
                    "--token", pat,
                    "--yes",
                    "--prod"
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            String deploymentUrl = "";
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[Vercel CLI]: " + line);
                    java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(https://[a-zA-Z0-9-]+\\.vercel\\.app)").matcher(line);
                    if (matcher.find()) {
                        deploymentUrl = matcher.group(1);
                        DeploymentEntity liveFolder = deploymentRepository.findById(folder.getId()).orElse(folder);
                        liveFolder.setUrl(deploymentUrl);
                        deploymentRepository.save(liveFolder);
                    }
                }
            }

            int exitCode = process.waitFor();
            
            DeploymentEntity finalFolder = deploymentRepository.findById(folder.getId()).orElse(folder);

            if (exitCode == 0) {
                finalFolder.setDeploy(DeployStage.DEPLOYED);
                finalFolder.setUrl(deploymentUrl);
                deploymentRepository.save(finalFolder);
            } else {
                finalFolder.setDeploy(DeployStage.FAILED);
                deploymentRepository.save(finalFolder);
            }

        } catch (Exception e) {
            System.err.println("CLI Deployment Error: " + e.getMessage());
            DeploymentEntity errorFolder = deploymentRepository.findById(folder.getId()).orElse(folder);
            errorFolder.setDeploy(DeployStage.FAILED);
            deploymentRepository.save(errorFolder);
        }
    }
}