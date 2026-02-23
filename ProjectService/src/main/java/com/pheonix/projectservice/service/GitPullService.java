package com.pheonix.projectservice.service;

import com.pheonix.projectservice.assets.GitDetails;
import com.pheonix.projectservice.assets.GitFolderDTO;
import com.pheonix.projectservice.repository.GitEntity;
import com.pheonix.projectservice.repository.GitFolderEntity;
import com.pheonix.projectservice.repository.GitFolderRepository;
import com.pheonix.projectservice.repository.GitRepository;
import com.pheonix.projectservice.repository.BuildRepository;
import com.pheonix.projectservice.repository.BuildEntity;
import jakarta.transaction.Transactional;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.PullResult;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.TransportException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class GitPullService {
    private final GitFolderRepository gitFolderRepository;
    private final GitRepository gitRepository;
    private final BuildRepository buildRepository;

    public GitPullService(GitFolderRepository gitFolderRepository, GitRepository gitRepository, BuildRepository buildRepository) {
        this.gitFolderRepository = gitFolderRepository;
        this.gitRepository = gitRepository;
        this.buildRepository = buildRepository;
    }

    @Transactional
    public String createGitRepoDetails(GitDetails gitDetails, String username) {
        Optional<GitEntity> user = gitRepository.findByUsername(username);

        if (user.isEmpty()) return "User not found.";

        GitFolderEntity gitFolderEntity = new GitFolderEntity(user.get(), gitDetails.fileName(), gitDetails.gitUrl(), gitDetails.branch());
        gitFolderRepository.save(gitFolderEntity);
        return "Git Repository credentials saved";
    }

    @Scheduled(fixedDelay = 20_000)
    public void updateRepository() throws IOException {
        int pageSize = 50;
        Page<GitFolderEntity> folderPage;

        File baseDir = Paths.get("repos").toAbsolutePath().toFile();
        if (!baseDir.exists() && !baseDir.mkdirs()) {
            throw new RuntimeException("Could not create repository storage directory");
        }

        do {
            Pageable pageable = PageRequest.of(0, pageSize);
            folderPage = gitFolderRepository.findByUpdated(false, pageable);

            for (GitFolderEntity folder : folderPage.getContent()) {

                File repoDir = null;
                try {
                    UsernamePasswordCredentialsProvider credentials =
                            new UsernamePasswordCredentialsProvider(
                                    folder.getGitEntity().getGitUsername(),
                                    folder.getGitEntity().getPat()
                            );
                    String repoName = extractRepoName(folder.getGitUrl());
                    String userDir = folder.getGitEntity().getUsername();
                    repoDir = new File(baseDir, userDir + "/" + repoName);

                    if (repoDir.exists() && new File(repoDir, ".git").exists()) {
                        try (Git git = Git.open(repoDir)) {

                            PullResult result = git.pull()
                                    .setCredentialsProvider(credentials)
                                    .call();

                            if (!result.isSuccessful()) {
                                System.err.println("Pull failed for: " + repoName);
                            } else {
                                System.out.println("Pulled successfully: " + repoName);
                            }
                        }

                    } else {
                        if (repoDir.exists()) {
                            deleteDirectory(repoDir);
                        }
                        try (Git git = Git.cloneRepository()
                                .setURI(folder.getGitUrl())
                                .setBranch(folder.getBranch())
                                .setDirectory(repoDir)
                                .setCredentialsProvider(credentials)
                                .call()) {

                            System.out.println("Cloned successfully: " + repoName);
                        }
                    }

                    folder.setStoredUrl(repoDir.getAbsolutePath());
                    folder.setUpdated(true);
                    gitFolderRepository.save(folder);

                } catch (TransportException e) {
                    folder.setUpdated(false);
                    folder.setPatFailure(true);
                    gitFolderRepository.save(folder);

                    if (repoDir.exists()) {
                        deleteDirectory(repoDir);
                    }
                } catch (IOException | GitAPIException e) {
                    System.err.println("Error processing repo: " + folder.getGitUrl());
                    e.printStackTrace();
                }
            }

        } while (folderPage.hasNext());
    }

    private String extractRepoName(String gitUrl) {
        String repoName = gitUrl.substring(gitUrl.lastIndexOf("/") + 1);
        if (repoName.endsWith(".git")) {
            repoName = repoName.substring(0, repoName.length() - 4);
        }
        return repoName;
    }

    private void deleteDirectory(File directory) throws IOException {
        Files.walk(directory.toPath())
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }

    @Transactional
    public String deleteProject(Long id, String username) {
        Optional<GitEntity> gitEntity = gitRepository.findByUsername(username);

        if (gitEntity.isEmpty()) return "User not found";

        if (gitFolderRepository.existsByGitEntityAndId(gitEntity.get(), id)) {
            Optional<GitFolderEntity> gitFolderEntity = gitFolderRepository.findById(id);
            
            if (gitFolderEntity.isPresent()) {
                // Delete associated build entities first to avoid foreign key constraint violation
                Optional<BuildEntity> buildEntity = buildRepository.findByGitFolderEntityAndBuildStart(gitFolderEntity.get(), true);
                buildEntity.ifPresent(buildRepository::delete);
                
                // Delete the directory if it exists
                String storedUrl = gitFolderEntity.get().getStoredUrl();
                if (storedUrl != null && !storedUrl.isEmpty()) {
                    try {
                        File repoDir = new File(storedUrl);
                        if (repoDir.exists()) {
                            deleteDirectory(repoDir);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
                
                // Now delete the project
                gitFolderRepository.deleteById(id);
                return "Project deleted.";
            }
        }
        return "Project not found.";
    }

    public List<GitFolderDTO> getAllProjects(String username) {
        Optional<GitEntity> gitEntity = gitRepository.findByUsername(username);
        if (gitEntity.isEmpty()) return null;

        return gitFolderRepository.findByGitEntityy(gitEntity.get());
    }
}
