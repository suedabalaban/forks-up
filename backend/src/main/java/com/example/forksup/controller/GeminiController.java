package com.example.forksup.controller;

import com.example.forksup.model.GeminiRequest;
import com.example.forksup.model.GeminiResponse;
import com.example.forksup.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {
    @Autowired
    private GeminiService geminiService;

    @PostMapping("/analyze")
    public GeminiResponse analyzeText(@RequestBody GeminiRequest request) {
        if (request == null || request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            throw new IllegalArgumentException("Input text cannot be null or empty");
        }
        return geminiService.analyzeText(request.getInputText());
    }
}
