package com.pheonix.deploymentservice.repository;

import com.pheonix.deploymentservice.assets.CloudInfrastructure;
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

    public DeploymentEntity() {}

    public DeploymentEntity(String username, CloudInfrastructure cloudInfrastructure, String pat, String region) {
        this.username = username;
        this.cloudInfrastructure = cloudInfrastructure;
        this.pat = pat;
        this.region = region;
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
}