package com.pheonix.deploymentservice.service;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeploymentController {

    private final DeploymentService deploymentService;

    public DeploymentController(DeploymentService deploymentService) {
        this.deploymentService = deploymentService;
    }

    @PostMapping("/project/deploy")
    public String deployProject(@RequestParam String storedUrl, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return deploymentService.deployProject(username, storedUrl);
    }
}
