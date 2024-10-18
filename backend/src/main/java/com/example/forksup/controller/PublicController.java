package com.example.forksup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("")
    public String getTest() {
        return "kayitli kullaniciyim ama email dogrulamam yok gorebilirim";
    }

}