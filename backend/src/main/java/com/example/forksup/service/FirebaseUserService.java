package com.example.forksup.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class FirebaseUserService {

    public String getDisplayName(String firebaseId) {
        try {
            UserRecord userRecord = FirebaseAuth.getInstance().getUser(firebaseId);
            return userRecord.getDisplayName();
        } catch (Exception e) {
            return null;
        }
    }

}
