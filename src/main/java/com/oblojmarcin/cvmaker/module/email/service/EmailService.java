package com.oblojmarcin.cvmaker.module.email.service;

import com.oblojmarcin.cvmaker.database.postgres.entity.User;
import com.oblojmarcin.cvmaker.module.email.constant.EmailConstant;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public void sendVerificationEmail(User user, String siteURL) {
        prepareAndSendEmail(user, siteURL, EmailConstant.VERIFICATION_EMAIL_SUBJECT, "verificationEmail");
    }

    public void sendPasswordResetEmail(User user, String siteURL) {
        prepareAndSendEmail(user, siteURL, EmailConstant.RESET_PASSWORD_SUBJECT, "resetPassword");
    }

    private void prepareAndSendEmail(User user, String siteURL, String subject, String templateName) {
        try {
            Context context = new Context();
            context.setVariable("username", user.getUsername());
            context.setVariable("siteURL", siteURL);
            String content = templateEngine.process(templateName, context);
            sendEmail(user.getEmail(), subject, content);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Problem with sending email", e);
        }
    }

    private void sendEmail(String recipientEmail, String subject, String content)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom("localhost", "CV Creator");
        helper.setTo(recipientEmail);
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }
}