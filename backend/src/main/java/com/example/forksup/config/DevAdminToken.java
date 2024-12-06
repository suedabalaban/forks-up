package com.example.forksup.config;

import java.util.Map;

public class DevAdminToken {
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
