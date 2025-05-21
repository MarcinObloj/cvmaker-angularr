package com.oblojmarcin.cvmaker.module.cvfile.controller;

import com.oblojmarcin.cvmaker.module.cvfile.service.CVFileService;
import com.oblojmarcin.cvmaker.shared.util.ApiConstant;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiConstant.CV_API)
public class CVFileController {

    private final CVFileService cvFileService;

    @PostMapping(ApiConstant.CV_UPLOAD_PDF)
    public ResponseEntity<Map<String, Object>> uploadCvHtml(
            @RequestParam("cvFile") MultipartFile cvFile,
            @RequestParam("userId") int userId) {
        Map<String, Object> response = cvFileService.uploadCvFile(cvFile, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping(ApiConstant.CV_LIST+"/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getCvFilesByUser(@PathVariable int userId) {
        List<Map<String, Object>> cvFiles = cvFileService.getCvFilesByUser(userId);
        if (cvFiles.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(cvFiles);
    }

    @DeleteMapping(ApiConstant.CV_DELETE+"/{id}")
    public ResponseEntity<String> deleteCvFile(@PathVariable int id) {
        return cvFileService.deleteCvFile(id);
    }

    @GetMapping(ApiConstant.CV_DOWNLOAD+"/{id}")
    public ResponseEntity<Resource> downloadCvFile(@PathVariable int id) {
        return cvFileService.downloadCvFile(id);
    }
}