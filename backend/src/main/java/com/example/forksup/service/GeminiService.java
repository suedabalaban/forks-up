package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.GeminiResponse;
import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import java.io.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    private RecipeRepository recipeRepository;

    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<String, String> responseCache = new ConcurrentHashMap<>();

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    public GeminiResponse analyzeText(String text){
        String apiKey = this.apiKey;
        String apiUrl = this.apiUrl;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", text);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "?key=" + apiKey,
                HttpMethod.POST,
                request,
                Map.class
        );

        try {
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("candidates")) {
                throw new IllegalStateException("Invalid response from Gemini API");
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new IllegalStateException("No response candidates from Gemini API");
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> responseContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) responseContent.get("parts");
            String generatedText = (String) parts.get(0).get("text");

            return new GeminiResponse(generatedText);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to process Gemini API response: " + e.getMessage());
        }
    }

    public GeminiResponse analyzeRecipe(String recipeId, String question){
        // Create cache key
        String cacheKey = recipeId + "-" + question.toLowerCase().trim();
        
        // Check cache first
        String cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse != null) {
            return new GeminiResponse(cachedResponse);
        }

        ObjectId idObj = new ObjectId(recipeId);
        Recipe recipe = recipeRepository.findById(idObj)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        List<String> ingredients = recipe.getIngredientsRawStr();
        if (ingredients == null || ingredients.isEmpty()) {
            throw new IllegalArgumentException("Recipe has no ingredients");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = String.format(
                "Recipe Name: %s\nDescription: %s\nIngredients:\n%s\nSteps:\n%s\n\n" +
                "Based on this recipe, answer the following question with ONLY 'Yes' or 'No', without including any recipe details: %s",
                recipe.getName(),
                recipe.getDescription(),
                String.join("\n- ", recipe.getIngredientsRawStr()),
                String.join("\n", recipe.getSteps()),
                question
        );

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "?key=" + apiKey,
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
        Map<String, Object> firstCandidate = candidates.get(0);
        Map<String, Object> responseContent = (Map<String, Object>) firstCandidate.get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) responseContent.get("parts");
        String generatedText = (String) parts.get(0).get("text");

        String cleanResponse = generatedText.trim().toLowerCase();
        String geminiResponse;
        if (cleanResponse.contains("yes") && !cleanResponse.contains("no")) {
            geminiResponse = "Yes";
        } else if (cleanResponse.contains("no") && !cleanResponse.contains("yes")) {
            geminiResponse = "No";
        } else {
            geminiResponse = "Please ask a yes/no question";
        }

        // Store in cache before returning
        responseCache.put(cacheKey, geminiResponse);
        return new GeminiResponse(geminiResponse);
    }
}
