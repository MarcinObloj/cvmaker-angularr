package com.oblojmarcin.cvmaker.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public Map uploadFile(File file, String folder) throws IOException {
        return cloudinary.uploader().upload(file, ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto" // ZMIANA: z raw -> auto
        ));
    }

    public String getCloudName() {
        return cloudinary.config.cloudName;
    }

}
