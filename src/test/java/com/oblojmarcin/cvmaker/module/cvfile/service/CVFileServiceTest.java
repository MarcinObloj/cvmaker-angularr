package com.oblojmarcin.cvmaker.module.cvfile.service;

import com.oblojmarcin.cvmaker.database.postgres.entity.CVFile;
import com.oblojmarcin.cvmaker.database.postgres.repository.CVFileRepository;
import com.oblojmarcin.cvmaker.shared.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CVFileServiceTest {

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private CVFileRepository cvFileRepository;

    @InjectMocks
    private CVFileService cvFileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldUploadCvAndReturnMetadata() throws Exception {
        // given
        int userId = 123;
        byte[] content = "dummy pdf content".getBytes();
        MockMultipartFile multipartFile = new MockMultipartFile("file", "cv.pdf", "application/pdf", content);

        Map<String, Object> cloudinaryResponse = new HashMap<>();
        cloudinaryResponse.put("secure_url", "https://cloudinary.com/fakefile.pdf");
        cloudinaryResponse.put("public_id", "cv-files/CV_123_abc123");

        when(cloudinaryService.uploadFile(any(File.class), eq("cv-files")))
                .thenReturn(cloudinaryResponse);

        when(cloudinaryService.getCloudName()).thenReturn("demo");

        when(cvFileRepository.save(any(CVFile.class))).thenAnswer(invocation -> {
            CVFile saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });

        // when
        Map<String, Object> result = cvFileService.uploadCvFile(multipartFile, userId);

        // then
        assertEquals("CV zostało zapisane w Cloudinary", result.get("message"));
        assertEquals("https://cloudinary.com/fakefile.pdf", result.get("cloudinaryUrl"));
        assertNotNull(result.get("thumbnailUrl"));
        assertTrue(result.get("thumbnailUrl").toString().contains("pg_1"));

        verify(cloudinaryService, times(1)).uploadFile(any(File.class), eq("cv-files"));
        verify(cvFileRepository, times(1)).save(any(CVFile.class));
    }
}
