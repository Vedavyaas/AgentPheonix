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
    public String createCloudCredentials(@RequestParam String storedUrl, @RequestBody CloudCredentials cloudCredentials, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return cloudCredentialService.makeDeployment(username, storedUrl, cloudCredentials);
    }

    @PutMapping("/update/credentials/pat")
    public String updatePat(@RequestParam String pat, @RequestParam String storedUrl, @AuthenticationPrincipal Jwt jwt) {
        return cloudCredentialService.updatePat(pat, storedUrl);
    }

    @PutMapping("/update/credentials/region")
    public String updateRegion(@RequestParam String region, @RequestParam String storedUrl, @AuthenticationPrincipal Jwt jwt) {
        return cloudCredentialService.updateRegion(region, storedUrl);
    }

    @PutMapping("/update/credential/infra")
    public String updateCloudInfra(@RequestParam CloudInfrastructure cloudInfrastructure, @RequestParam String storedUrl, @AuthenticationPrincipal Jwt jwt) {
        return cloudCredentialService.updateCloudInfrastructure(cloudInfrastructure, storedUrl);
    }
}
