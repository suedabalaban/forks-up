package com.example.forksup.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

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

    public static class DevAdminToken {

        private final String uid;

        private final String email;

        private final Map<String, Object> claims;

        public DevAdminToken(String uid, String email) {
            this.uid = uid;
            this.email = email;
            this.claims = Map.of(
                "uid", uid,
                "email", email,
                "email_verified", true,
                "name", "Admin",
                "admin", true
            );
        }

        public String getUid() {
            return uid;
        }

        public String getEmail() {
            return email;
        }

        public boolean isEmailVerified() {
            return true;
        }

        public String getName() {
            return "Admin";
        }

        public String getPicture() {
            return null;
        }

        public String getIssuer() {
            return "dev-admin";
        }

        public String getSubject() {
            return uid;
        }

        public Map<String, Object> getClaims() {
            return claims;
        }

    }
}
