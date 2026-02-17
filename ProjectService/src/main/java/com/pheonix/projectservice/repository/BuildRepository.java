package com.pheonix.projectservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BuildRepository extends JpaRepository<BuildEntity, Long> {
    Page<BuildEntity> findByBuildMessageSentAndBuildStart(boolean buildMessageSent, boolean buildStart, Pageable pageable);

    Optional<BuildEntity> findByGitFolderEntityAndBuildStart(GitFolderEntity gitFolderEntity, boolean buildStart);
}
