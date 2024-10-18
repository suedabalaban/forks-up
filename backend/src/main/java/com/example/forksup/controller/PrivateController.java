package com.example.forksup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/private")
public class PrivateController {

    @GetMapping("")
    public String getTest() {
        return "e mail dogrulamam var burayi gorebilirim";
    }

}
