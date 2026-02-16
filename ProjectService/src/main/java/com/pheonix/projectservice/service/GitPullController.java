package com.pheonix.projectservice.service;

import com.pheonix.projectservice.assets.GitDetails;
import com.pheonix.projectservice.assets.GitFolderDTO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class GitPullController {
    private final GitPullService gitPullService;

    public GitPullController(GitPullService gitPullService) {
        this.gitPullService = gitPullService;
    }

    @PostMapping("/git/details/repo")
    public String getRepoDetails(@RequestBody GitDetails gitDetails, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitPullService.createGitRepoDetails(gitDetails, username);
    }

    @DeleteMapping("/git/delete")
    public String deleteDetails(@RequestParam Long id, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitPullService.deleteProject(id, username);
    }

    @GetMapping("/get/all")
    public List<GitFolderDTO> getAllProjects(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitPullService.getAllProjects(username);
    }
}
