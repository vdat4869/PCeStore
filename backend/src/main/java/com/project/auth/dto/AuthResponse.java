package com.project.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private boolean mfaRequired;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.mfaRequired = false;
    }

    public AuthResponse(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public boolean isMfaRequired() {
        return mfaRequired;
    }

    public void setMfaRequired(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }
}
