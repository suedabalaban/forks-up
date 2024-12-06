package com.example.forksup.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class DevConfig {
    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @Value("${app.dev-admin-token:dev-admin-token}")
    public String devAdminToken;

    public boolean isDevMode() {
        return devMode;
    }

    public String getDevAdminToken() {
        return devAdminToken;
    }

    public boolean isDevAdminToken(String token) {
        return devMode && devAdminToken.equals(token);
    }
}
