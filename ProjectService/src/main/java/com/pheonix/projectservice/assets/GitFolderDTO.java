package com.pheonix.projectservice.assets;

public record GitFolderDTO(Long id, String fileName, String gitUrl, String branch, String storedUrl, boolean updated, boolean patFailure) {
}
