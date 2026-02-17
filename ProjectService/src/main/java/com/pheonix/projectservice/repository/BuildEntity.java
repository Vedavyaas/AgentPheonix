package com.pheonix.projectservice.repository;

import jakarta.persistence.*;

@Entity
public class BuildEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private boolean buildStart;
    @OneToOne
    private GitFolderEntity gitFolderEntity;
    private boolean buildMessageSent;

    public BuildEntity() {
    }

    public BuildEntity(boolean buildStart, GitFolderEntity gitFolderEntity) {
        this.buildStart = buildStart;
        this.gitFolderEntity = gitFolderEntity;
        this.buildMessageSent = false;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public boolean isBuildStart() {
        return buildStart;
    }

    public void setBuildStart(boolean buildStart) {
        this.buildStart = buildStart;
    }

    public GitFolderEntity getGitFolderEntity() {
        return gitFolderEntity;
    }

    public void setGitFolderEntity(GitFolderEntity gitFolderEntity) {
        this.gitFolderEntity = gitFolderEntity;
    }

    public boolean isBuildMessageSent() {
        return buildMessageSent;
    }

    public void setBuildMessageSent(boolean buildMessageSent) {
        this.buildMessageSent = buildMessageSent;
    }
}
