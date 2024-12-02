package com.example.forksup.controller;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.GeminiRequest;
import com.example.forksup.model.GeminiResponse;
import com.example.forksup.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @PostMapping("/analyzeRecipe")
    public ResponseEntity<GeminiResponse> analyzeRecipe(
            @RequestParam String recipeId,
            @RequestBody GeminiRequest request) {
        if (request == null || request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            throw new IllegalArgumentException("Question cannot be null or empty");
        }
        try {
            GeminiResponse response = geminiService.analyzeRecipe(recipeId, request.getInputText());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResourceNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
