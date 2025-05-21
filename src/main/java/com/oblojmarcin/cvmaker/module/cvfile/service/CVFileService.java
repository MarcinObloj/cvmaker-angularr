package com.oblojmarcin.cvmaker.module.cvfile.service;

import com.oblojmarcin.cvmaker.database.postgres.entity.CVFile;
import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import com.oblojmarcin.cvmaker.database.postgres.repository.CVFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CVFileService {

    private final CVFileRepository cvFileRepository;


    public Map<String, Object> uploadCvFile(MultipartFile cvFile, int userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            String uniqueId = UUID.randomUUID().toString();
            String fileName = "CV_" + userId + "_" + uniqueId + ".pdf";
            String filePath = System.getProperty("user.dir") + "/cv-files/" + fileName;

            File pdfFile = new File(filePath);
            try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
                fos.write(cvFile.getBytes());
            }

            CVFile cvFileEntity = saveCvFile(userId, filePath, fileName);
            response.put("message", "CV zostało poprawnie zapisane w formacie PDF");
            response.put("cvFileId", cvFileEntity.getId());

            return response;
        } catch (IOException e) {
            throw new RuntimeException("Error occurred while saving CV: " + e.getMessage());
        }
    }

    public CVFile saveCvFile(int userId, String filePath, String fileName) {
        User user = new User();
        user.setUserId(userId); // Zakładamy, że User ma setId i getId

        CVFile cvFile = new CVFile();
        cvFile.setUser(user);
        cvFile.setFilePath(filePath);
        cvFile.setFileName(fileName);
        cvFile.setCreatedAt(LocalDateTime.now());
        return cvFileRepository.save(cvFile);
    }

    public List<Map<String, Object>> getCvFilesByUser(int userId) {
        List<CVFile> cvFiles = cvFileRepository.findByUserUserId(userId);
        return cvFiles.stream().map(cvFile -> {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("id", cvFile.getId());
            responseMap.put("fileName", cvFile.getFileName());
            responseMap.put("createdAt", cvFile.getCreatedAt());
            responseMap.put("downloadUrl", "http://localhost:8080/api/cvfile/download/" + cvFile.getId());
            return responseMap;
        }).collect(Collectors.toList());
    }

    public ResponseEntity<String> deleteCvFile(int id) {
        try {
            CVFile cvFile = cvFileRepository.findById(id).orElse(null);
            if (cvFile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("CV not found");
            }

            File file = new File(cvFile.getFilePath());
            if (file.exists()) {
                file.delete();
            }

            cvFileRepository.deleteById(id);
            return ResponseEntity.ok("CV deleted successfully");
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while deleting CV: " + e.getMessage());
        }
    }

    public ResponseEntity<Resource> downloadCvFile(int id) {
        CVFile cvFile = cvFileRepository.findById(id).orElse(null);
        if (cvFile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        File file = new File(cvFile.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + cvFile.getFileName() + "\"")
                .body(resource);
    }
}