package com.example.forksup.controller;

import com.example.forksup.model.request.GeminiRequest;
import com.example.forksup.model.response.GeminiResponse;
import com.example.forksup.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {
    
    @Autowired
    private GeminiService geminiService;

    /**
     * Analyses a recipe's dietary restrictions using Google's Gemini AI.
     * This endpoint processes natural language questions about a recipe's dietary compliance
     * and generates AI-powered responses regarding:
     * - Vegetarian/Vegan status
     * - Common allergen presence
     * - Religious dietary compliance (halal, kosher, etc.)
     * - Other dietary restrictions
     *
     * Input Validation:
     * - Rejects empty or null questions
     * - Limits question length to 100 characters
     * - Validates recipe ID existence
     *
     * Caching Mechanism:
     * - Uses an in-memory cache to store responses for repeated questions on the same recipe.
     * - Reduces redundant API calls to Gemini AI for the same request.
     *
     * @param recipeId Unique identifier of the recipe to analyze.
     * @param request GeminiRequest object containing the user's dietary question.
     * @return ResponseEntity containing:
     *         - GeminiResponse with AI-generated dietary analysis.
     *         - HTTP 400 (BAD_REQUEST) for invalid input or processing errors.
     *         - Error message if the question exceeds the length limit.
     */
    @PostMapping("/{recipeId}")
    public ResponseEntity<GeminiResponse> analyzeRecipe(
            @PathVariable String recipeId,
            @RequestBody GeminiRequest request) {
        if (request.getInputText() == null || request.getInputText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getInputText().length() > 100) {
            return ResponseEntity.badRequest().body(new GeminiResponse("Question length should not exceed 100 characters"));
        }
        try {
            GeminiResponse response = geminiService.analyzeRecipe(recipeId, request.getInputText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/questions")
    public List<String> getPredefinedQuestions(){
        return geminiService.getPredefinedQuestions();
    }

    /**
     * Provides AI-powered analysis of recipe steps using Google's Gemini.
     * This endpoint allows users to ask questions about recipe preparation and receives
     * detailed explanations about:
     * - Cooking techniques used
     * - Time management suggestions
     * - Equipment requirements
     * - Step-by-step clarifications
     * - Potential substitutions or modifications
     *
     * Input Validation:
     * - Rejects empty or null questions
     * - Limits question length to 100 characters
     * - Validates recipe ID existence
     *
     * Error Handling:
     * - Returns BAD_REQUEST for invalid inputs
     * - Provides specific error message for length violations
     * - Handles Gemini API exceptions gracefully
     *
     * @param recipeId Unique identifier of the recipe to analyze
     * @param request GeminiRequest object containing the user's question about recipe steps
     * @return ResponseEntity containing:
     *         - GeminiResponse with AI-generated step analysis
     *         - HTTP 400 (BAD_REQUEST) for invalid input or processing errors
     *         - Error message if question exceeds length limit
     */
//    @PostMapping("/recipe/{recipeId}/steps")
//    public ResponseEntity<GeminiResponse> analyzeRecipeSteps(
//            @PathVariable String recipeId,
//            @RequestBody GeminiRequest request) {
//        if (request.getInputText() == null || request.getInputText().trim().isEmpty()) {
//            return ResponseEntity.badRequest().build();
//        }
//        if (request.getInputText().length() > 100) {
//            return ResponseEntity.badRequest().body(new GeminiResponse("Question length should not exceed 100 characters"));
//        }
//        try {
//            GeminiResponse response = geminiService.analyzeRecipeSteps(recipeId, request.getInputText());
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

}
