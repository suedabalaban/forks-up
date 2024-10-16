package com.example.forksup.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/private")
    public String getPrivateData() {
        return "This is private data, accessible only with a valid JWT token.";
    }

}