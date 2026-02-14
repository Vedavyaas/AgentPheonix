package com.pheonix.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GitRepository extends JpaRepository<GitEntity, Long> {
    Optional<GitEntity> findByUsername(String username);
}
