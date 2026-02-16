package com.pheonix.projectservice.repository;

import com.pheonix.projectservice.assets.GitFolderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GitFolderRepository extends JpaRepository<GitFolderEntity, Long> {
    Page<GitFolderEntity> findByUpdated(boolean updated, Pageable pageable);

    Page<GitFolderEntity> findByPatFailure(boolean b, Pageable pageable);

    Optional<GitFolderEntity> findByGitEntity(GitEntity gitEntity);

    @Query("""
       SELECT new com.pheonix.projectservice.assets.GitFolderDTO(
           f.id,
           f.fileName,
           f.gitUrl, 
           f.branch      
       )
       FROM GitFolderEntity f
       WHERE f.gitEntity = :gitEntity
       """)
    List<GitFolderDTO> findByGitEntityy(GitEntity gitEntity);
    boolean existsByGitEntityAndId(GitEntity gitEntity, Long id);
}
