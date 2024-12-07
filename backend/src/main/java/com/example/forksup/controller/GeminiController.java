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

    @PostMapping("/recipe/{recipeId}/dietary")
    public ResponseEntity<GeminiResponse> checkDietaryRestriction(
            @PathVariable String recipeId,
            @RequestBody GeminiRequest request) {
        if (request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getInputText().length() > 100) {
            return ResponseEntity.badRequest().body(new GeminiResponse("Question length should not exceed 100 characters"));
        }
        try {
            GeminiResponse response = geminiService.checkDietaryRestriction(recipeId, request.getInputText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/recipe/{recipeId}/steps")
    public ResponseEntity<GeminiResponse> analyzeRecipeSteps(
            @PathVariable String recipeId,
            @RequestBody GeminiRequest request) {
        if (request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getInputText().length() > 100) {
            return ResponseEntity.badRequest().body(new GeminiResponse("Question length should not exceed 100 characters"));
        }
        try {
            GeminiResponse response = geminiService.analyzeRecipeSteps(recipeId, request.getInputText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
