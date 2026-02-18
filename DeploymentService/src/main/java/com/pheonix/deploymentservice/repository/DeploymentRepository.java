package com.pheonix.deploymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeploymentRepository extends JpaRepository<DeploymentEntity, Long> {
    boolean existsByUsername(String username);

    Optional<DeploymentEntity> findByUsername(String username);
}
