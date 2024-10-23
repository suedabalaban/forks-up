package com.example.forksup.controller;


import com.example.forksup.model.User;
import com.example.forksup.repository.UserRepository;
import com.example.forksup.service.UserService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.mockito.internal.matchers.Null;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping( path = "/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        User u =  userService.getUserById(id);
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(u, null, HttpStatus.OK);
    }

    @PutMapping(path = "")
    public ResponseEntity<String> createUser(HttpServletRequest request) {
        try {
            FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
            System.out.println(firebaseToken.getName());
        } catch (Exception e) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

}
