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
        String ref = (String) payload.get("ref");
        if (ref == null || !ref.startsWith("refs/heads/")) return;

        String branchName = ref.replace("refs/heads/", "");
        Map<String, Object> sender = (Map<String, Object>) payload.get("sender");
        String username = (String) sender.get("login");

        Map<String, Object> repository = (Map<String, Object>) payload.get("repository");
        String projectUrl = (String) repository.get("html_url");

        Optional<GitFolderEntity> gitFolderEntity = gitFolderRepository.findByBranchAndGitUrlAndGitEntity_GitUsername(branchName, projectUrl, username);

        if (gitFolderEntity.isEmpty() && !projectUrl.endsWith(".git")) {
            gitFolderEntity = gitFolderRepository.findByBranchAndGitUrlAndGitEntity_GitUsername(branchName, projectUrl + ".git", username);
        }

        if (gitFolderEntity.isPresent()) {
            GitFolderEntity folder = gitFolderEntity.get();
            folder.setUpdated(false);
            gitFolderRepository.save(folder);

            Optional<BuildEntity> buildEntity = buildRepository.findByGitFolderEntityAndBuildStart(folder, true);

            if (buildEntity.isPresent()) {
                buildEntity.get().setBuildMessageSent(false);
                buildRepository.save(buildEntity.get());
            } else {
                BuildEntity newBuild = new BuildEntity(true, folder);
                buildRepository.save(newBuild);
            }
        }
    }
}
