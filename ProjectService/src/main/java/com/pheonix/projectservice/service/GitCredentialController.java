package com.pheonix.projectservice.service;

import com.pheonix.projectservice.assets.GitCredentials;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
public class GitCredentialController {
    private final GitCredentialsService gitCredentialsService;

    public GitCredentialController(GitCredentialsService gitCredentialsService) {
        this.gitCredentialsService = gitCredentialsService;
    }

    @PostMapping("/set/credentials")
    public String setCredentials(@RequestBody GitCredentials gitCredentials, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitCredentialsService.setCredentials(gitCredentials, username);
    }

    @PutMapping("/update/credentials/username")
    public String setGitUsername(@RequestParam String gitUsername, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitCredentialsService.setGitUsername(gitUsername, username);
    }

    @PutMapping("/update/credentials/pat")
    public String setPAT(@RequestParam String pat, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return gitCredentialsService.setPAT(pat, username);
    }
}
