package com.pheonix.deploymentservice.service;

import com.pheonix.deploymentservice.assets.CloudCredentials;
import com.pheonix.deploymentservice.assets.CloudInfrastructure;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
public class CloudCredentialController {
    private final CloudCredentialService cloudCredentialService;

    public CloudCredentialController(CloudCredentialService cloudCredentialService) {
        this.cloudCredentialService = cloudCredentialService;
    }

    @PostMapping("/create/credentials/cloud")
    public String createCloudCredentials(@RequestBody CloudCredentials cloudCredentials, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return cloudCredentialService.makeDeployment(username, cloudCredentials);
    }

    @PutMapping("/update/credentials/pat")
    public String updatePat(@RequestParam String pat, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return cloudCredentialService.updatePat(pat, username);
    }

    @PutMapping("/update/credentials/region")
    public String updateRegion(@RequestParam String region, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return cloudCredentialService.updateRegion(region, username);
    }

    @PutMapping("/update/credential/infra")
    public String updateCloudInfra(@RequestParam CloudInfrastructure cloudInfrastructure, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return cloudCredentialService.updateCloudInfrastructure(cloudInfrastructure, username);
    }
}
