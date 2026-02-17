package com.pheonix.projectservice.service;

import com.pheonix.projectservice.repository.BuildEntity;
import com.pheonix.projectservice.repository.BuildRepository;
import com.pheonix.projectservice.repository.GitFolderEntity;
import com.pheonix.projectservice.repository.GitFolderRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class BuildService {
    private final GitFolderRepository gitFolderRepository;
    private final BuildRepository buildRepository;

    public BuildService(GitFolderRepository gitFolderRepository, BuildRepository buildRepository) {
        this.gitFolderRepository = gitFolderRepository;
        this.buildRepository = buildRepository;
    }

    public String startBuild(Long id, String username) {
        Optional<GitFolderEntity> gitFolderEntity = gitFolderRepository.findById(id);
        if (gitFolderEntity.isEmpty()) return "Project not found.";

        if (gitFolderEntity.get().getGitEntity().getUsername().equals(username)) {
            BuildEntity buildEntity = new BuildEntity(true, gitFolderEntity.get());
            buildRepository.save(buildEntity);

            return "Build will start shortly.";
        }

        return "You do not have access to this project.";
    }

    public void processCommitFromGithub(Map<String, Object> payload) {
        Map<String, Object> pusher = (Map<String, Object>) payload.get("pusher");
        String username = (String) pusher.get("name");

        String ref = (String) payload.get("ref");
        String branchName = ref.replace("refs/heads/", "");

        Map<String, Object> repository = (Map<String, Object>) payload.get("repository");
        String projectUrl = (String) repository.get("html_url");

        Optional<GitFolderEntity> gitFolderEntity = gitFolderRepository.findByBranchAndGitUrlAndGitEntity_GitUsername(branchName, projectUrl, username);

        if (gitFolderEntity.isPresent()) {
            Optional<BuildEntity> buildEntity = buildRepository.findByGitFolderEntityAndBuildStart(gitFolderEntity.get(), true);

            if (buildEntity.isPresent()) {
                gitFolderEntity.get().setUpdated(false);
                buildEntity.get().setBuildMessageSent(false);
                gitFolderRepository.save(gitFolderEntity.get());
                buildRepository.save(buildEntity.get());
            }
        }
    }
}
