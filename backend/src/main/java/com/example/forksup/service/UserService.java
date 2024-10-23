package com.example.forksup.service;


import com.example.forksup.model.User;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(String id) {
        try {
            ObjectId idObj = new ObjectId(id);
            return userRepository.findById(idObj).orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Boolean insertUser(User user) {
        try {
            userRepository.insert(user);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

}
