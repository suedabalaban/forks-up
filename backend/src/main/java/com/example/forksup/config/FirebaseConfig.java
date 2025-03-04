package com.example.forksup.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${GOOGLE_APPLICATION_CREDENTIALS:#{null}}")
    private String firebaseCredentialsPath;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        InputStream serviceAccount;
        
        if (firebaseCredentialsPath != null) {
            // Docker environment - use the mounted credentials file
            serviceAccount = new FileInputStream(firebaseCredentialsPath);
        } else {
            // Local development - use classpath resource
            serviceAccount = new ClassPathResource("forks-up-firebase-adminsdk-4zto3-335c30c024.json")
                    .getInputStream();
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        return FirebaseApp.initializeApp(options);
    }
}