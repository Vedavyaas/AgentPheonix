package com.pheonix.deploymentservice.repository;

import com.pheonix.deploymentservice.assets.DeployStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeploymentRepository extends JpaRepository<DeploymentEntity, Long> {
    boolean existsByUsername(String username);

    Optional<DeploymentEntity> findByUsername(String username);

    Optional<DeploymentEntity> findByStoredUrl(String storedUrl);

    boolean existsByStoredUrl(String storedUrl);

    Optional<DeploymentEntity> findByStoredUrlAndUsername(String storedUrl, String username);

    Page<DeploymentEntity> findByDeployAndBuilt(DeployStage deploy, boolean built, Pageable pageable);
}
