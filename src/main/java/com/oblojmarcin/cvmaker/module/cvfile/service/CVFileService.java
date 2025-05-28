package com.oblojmarcin.cvmaker.module.cvfile.service;

import com.oblojmarcin.cvmaker.database.postgres.entity.CVFile;
import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import com.oblojmarcin.cvmaker.database.postgres.repository.CVFileRepository;
import com.oblojmarcin.cvmaker.shared.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;
import org.springframework.core.io.InputStreamResource;
@Service
@RequiredArgsConstructor
public class CVFileService {

    private final CVFileRepository cvFileRepository;
    private final CloudinaryService cloudinaryService;


    public Map<String, Object> uploadCvFile(MultipartFile cvFile, int userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            String uniqueId = UUID.randomUUID().toString();
            String fileName = "CV_" + userId + "_" + uniqueId + ".pdf";

            // 1. Zapisz plik tymczasowo
            File tempFile = File.createTempFile("cv_temp_", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(cvFile.getBytes());
            }

            // 2. Upload do Cloudinary
            Map uploadResult = cloudinaryService.uploadFile(tempFile, "cv-files");

            String cloudinaryUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();
            String thumbnailUrl = String.format("https://res.cloudinary.com/%s/image/upload/w_300,h_400,c_fit/pg_1/%s.png",
                    cloudinaryService.getCloudName(), publicId);

            tempFile.delete(); // 3. Usuń temp

            // 4. Zapisz do DB
            CVFile cvFileEntity = saveCvFile(userId, cloudinaryUrl, fileName);

            response.put("message", "CV zostało zapisane w Cloudinary");
            response.put("cvFileId", cvFileEntity.getId());
            response.put("cloudinaryUrl", cloudinaryUrl);
            response.put("thumbnailUrl", thumbnailUrl);

            return response;
        } catch (IOException e) {
            throw new RuntimeException("Error occurred while uploading CV to Cloudinary: " + e.getMessage());
        }
    }



    public CVFile saveCvFile(int userId, String fileUrl, String fileName) {
        User user = new User();
        user.setUserId(userId);

        CVFile cvFile = new CVFile();
        cvFile.setUser(user);
        cvFile.setFilePath(fileUrl); // <-- zapisujemy URL, nie lokalną ścieżkę
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
            responseMap.put("thumbnailUrl", buildThumbnailUrl(cvFile.getFilePath()));
            return responseMap;
        }).collect(Collectors.toList());
    }

    // helper
    private String buildThumbnailUrl(String fileUrl) {
        try {
            String[] parts = fileUrl.split("/upload/");
            if (parts.length < 2) return null;
            String publicId = parts[1].replace(".pdf", "");
            return String.format("https://res.cloudinary.com/%s/image/upload/w_300,h_400,c_fit/pg_1/%s.png",
                    cloudinaryService.getCloudName(), publicId);
        } catch (Exception e) {
            return null;
        }
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

    public ResponseEntity<Void> downloadCvFile(int id) {
        CVFile cvFile = cvFileRepository.findById(id).orElse(null);
        if (cvFile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String fileUrl = cvFile.getFilePath();
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", fileUrl)
                .build();
    }

}