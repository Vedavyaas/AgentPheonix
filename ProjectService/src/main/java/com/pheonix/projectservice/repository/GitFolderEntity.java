package com.pheonix.projectservice.repository;

import jakarta.persistence.*;

@Entity
public class GitFolderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    private GitEntity gitEntity;
    private String fileName;
    private String gitUrl;
    private String branch;
    private boolean updated;
    private String storedUrl;
    private boolean patFailure;

    public GitFolderEntity() {}

    public GitFolderEntity(GitEntity gitEntity, String fileName, String gitUrl, String branch) {
        this.gitEntity = gitEntity;
        this.fileName = fileName;
        this.gitUrl = gitUrl;
        this.branch = branch;
        this.updated = false;
        this.patFailure = false;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public GitEntity getGitEntity() {
        return gitEntity;
    }

    public void setGitEntity(GitEntity gitEntity) {
        this.gitEntity = gitEntity;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getGitUrl() {
        return gitUrl;
    }

    public void setGitUrl(String gitUrl) {
        this.gitUrl = gitUrl;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public boolean isUpdated() {
        return updated;
    }

    public void setUpdated(boolean updated) {
        this.updated = updated;
    }

    public String getStoredUrl() {
        return storedUrl;
    }

    public void setStoredUrl(String storedUrl) {
        this.storedUrl = storedUrl;
    }

    public boolean isPatFailure() {
        return patFailure;
    }

    public void setPatFailure(boolean patFailure) {
        this.patFailure = patFailure;
    }
}
