package com.example.forksup.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/meow")
    public String getAuth() {
        return "this is auth and meow";
    }

}