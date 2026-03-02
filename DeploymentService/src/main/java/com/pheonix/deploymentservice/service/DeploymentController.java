package com.pheonix.deploymentservice.service;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import com.pheonix.deploymentservice.repository.DeploymentEntity;
import com.pheonix.deploymentservice.repository.DeploymentRepository;
import java.util.List;

@RestController
public class DeploymentController {

    private final DeploymentService deploymentService;
    private final DeploymentRepository deploymentRepository;

    public DeploymentController(DeploymentService deploymentService, DeploymentRepository deploymentRepository) {
        this.deploymentService = deploymentService;
        this.deploymentRepository = deploymentRepository;
    }

    @PostMapping("/project/deploy")
    public String deployProject(@RequestParam String storedUrl, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return deploymentService.deployProject(username, storedUrl);
    }

    @GetMapping("/projects/status")
    public List<DeploymentEntity> getDeploymentStatuses(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return deploymentRepository.findAllByUsername(username);
    }
}
