package com.example.forksup.controller;


import com.example.forksup.model.User;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        if (id == null || id.length() != 24) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        try {
            ObjectId idObj = new ObjectId(id);
            User user = userRepository.findById(idObj).orElse(null);
            if (user == null) {
                return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(user, null, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
    }
}
