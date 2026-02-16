package com.pheonix.projectservice.service;

import com.pheonix.projectservice.assets.GitCredentials;
import com.pheonix.projectservice.repository.GitEntity;
import com.pheonix.projectservice.repository.GitFolderEntity;
import com.pheonix.projectservice.repository.GitFolderRepository;
import com.pheonix.projectservice.repository.GitRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GitCredentialsService {
    private final GitRepository gitRepository;
    private final GitFolderRepository gitFolderRepository;

    public GitCredentialsService(GitRepository gitRepository, GitFolderRepository gitFolderRepository) {
        this.gitRepository = gitRepository;
        this.gitFolderRepository = gitFolderRepository;
    }

    @Transactional
    public String setCredentials(GitCredentials gitCredentials, String username) {
        Optional<GitEntity> gitEntity = gitRepository.findByUsername(username);

        if (gitEntity.isEmpty()) return "No user found";

        gitEntity.get().setGitUsername(gitCredentials.gitUsername());
        gitEntity.get().setPat(gitCredentials.pat());

        gitRepository.save(gitEntity.get());

        return "Credentials stored successfully.";
    }

    @Transactional
    public String setGitUsername(String gitUsername, String username) {
        Optional<GitEntity> gitEntity = gitRepository.findByUsername(username);

        if (gitEntity.isEmpty()) return "No user found.";

        gitEntity.get().setGitUsername(gitUsername);
        gitRepository.save(gitEntity.get());
        return "Git username changed successfully.";
    }

    @Transactional
    public String setPAT(String pat, String username) {
        Optional<GitEntity> gitEntity = gitRepository.findByUsername(username);

        if (gitEntity.isEmpty()) return "No user found.";

        gitEntity.get().setPat(pat);
        Optional<GitFolderEntity> gitFolderEntity = gitFolderRepository.findByGitEntity(gitEntity.get());

        if (gitFolderEntity.isPresent()) {
            gitFolderEntity.get().setPatFailure(false);
            gitFolderRepository.save(gitFolderEntity.get());
        }

        gitRepository.save(gitEntity.get());
        return "Git pat is changed successfully.";
    }
}
