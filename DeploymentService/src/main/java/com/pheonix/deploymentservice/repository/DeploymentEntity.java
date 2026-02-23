package com.pheonix.deploymentservice.repository;

import com.pheonix.deploymentservice.assets.CloudInfrastructure;
import com.pheonix.deploymentservice.assets.DeployStage;
import jakarta.persistence.*;

@Entity
public class DeploymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String username;
    @Enumerated(EnumType.STRING)
    private CloudInfrastructure cloudInfrastructure;
    private String pat;
    private String region;
    private String storedUrl;
    private boolean built;
    @Enumerated(EnumType.STRING)
    private DeployStage deploy;

    public DeploymentEntity() {}

    public DeploymentEntity(String username, String storedUrl, CloudInfrastructure cloudInfrastructure, String pat, String region) {
        this.username = username;
        this.storedUrl = storedUrl;
        this.cloudInfrastructure = cloudInfrastructure;
        this.pat = pat;
        this.region = region;
        this.built = false;
        this.deploy = DeployStage.NOT_STARTED;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public CloudInfrastructure getCloudInfrastructure() {
        return cloudInfrastructure;
    }

    public void setCloudInfrastructure(CloudInfrastructure cloudInfrastructure) {
        this.cloudInfrastructure = cloudInfrastructure;
    }

    public String getPat() {
        return pat;
    }

    public void setPat(String pat) {
        this.pat = pat;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getStoredUrl() {
        return storedUrl;
    }

    public void setStoredUrl(String storedUrl) {
        this.storedUrl = storedUrl;
    }

    public boolean isBuilt() {
        return built;
    }

    public void setBuilt(boolean built) {
        this.built = built;
    }

    public DeployStage isDeploy() {
        return deploy;
    }

    public void setDeploy(DeployStage deploy) {
        this.deploy = deploy;
    }
}