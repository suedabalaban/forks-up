package com.example.forksup;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/authentication")
public class AuthController {

    @GetMapping(value = "/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("Public Endpoint Working fine !");
    }

    @GetMapping(value = "/private")
    public ResponseEntity<String> privateEndpoint() {
        return ResponseEntity.ok("Private Endpoint Working fine !");
    }

}