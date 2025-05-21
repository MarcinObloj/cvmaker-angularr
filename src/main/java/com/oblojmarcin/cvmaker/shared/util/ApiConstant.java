package com.oblojmarcin.cvmaker.shared.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ApiConstant {
    public static final String CV_API = "/api/cvfile";
    public static final String CV_UPLOAD_PDF = "/uploadPdf";
    public static final String CV_LIST ="/list";
    public static final String CV_DELETE ="/delete";
    public static final String CV_DOWNLOAD ="/download";

    public static final String USER_API = "/api/users";
    public static final String USER_REGISTER ="/register";
    public static final String USER_LOGIN ="/login";
    public static final String USER_RESET_PASSWORD ="/reset-password";
    public static final String USER_CHANGE_PASSWORD ="/change-password";
    public static final String USER_VERIFY ="/verify";

    public static final String siteURL= "http://localhost:4200";
    public static final String RESET_URL = "http://localhost:4200/reset";
}