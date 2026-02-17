package com.pheonix.projectservice.service;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class BuildController {
    private final BuildService buildService;

    public BuildController(BuildService buildService) {
        this.buildService = buildService;
    }

    @PostMapping("/start/build")
    public String startBuild(@RequestParam Long id, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();
        return buildService.startBuild(id, username);
    }

    @PostMapping("/github/build")
    public void commitBuild(@RequestBody Map<String, Object> payload) {
        buildService.processCommitFromGithub(payload);
    }
}
