package com.example.forksup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/private/forks-up")
public class ForksUpController {

    @GetMapping("")
    public String getPrivate() {
        return "Private u need access token babe";
    }

}
