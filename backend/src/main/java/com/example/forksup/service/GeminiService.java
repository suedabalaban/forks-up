package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.GeminiResponse;
import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.prompt.RecipePromptBuilder;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
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

    private Recipe getRecipe(String recipeId) {
        ObjectId idObj = new ObjectId(recipeId);
        return recipeRepository.findById(idObj)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));
    }

    private GeminiResponse sendGeminiRequest(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
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
            return new GeminiResponse(((String) parts.get(0).get("text")).trim());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to process Gemini API response: " + e.getMessage());
        }
    }

    public GeminiResponse checkDietaryRestriction(String recipeId, String restriction) {
        String cacheKey = recipeId + "-is-" + restriction.toLowerCase().trim();
        
        String cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse != null) {
            return new GeminiResponse(cachedResponse);
        }

        Recipe recipe = getRecipe(recipeId);
        String prompt = new RecipePromptBuilder(recipe, 
                "explain in one short sentence if this recipe is " + restriction + " or not.")
                .withIngredients()
                .build();
        
        GeminiResponse response = sendGeminiRequest(prompt);
        responseCache.put(cacheKey, response.getResponse());
        return response;
    }

    public GeminiResponse analyzeRecipeSteps(String recipeId, String question) {
        String cacheKey = recipeId + "-steps-" + question.toLowerCase().trim();
        
        String cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse != null) {
            return new GeminiResponse(cachedResponse);
        }

        Recipe recipe = getRecipe(recipeId);
        String prompt = new RecipePromptBuilder(recipe, question)
                .withSteps()
                .build();
        
        GeminiResponse response = sendGeminiRequest(prompt);
        responseCache.put(cacheKey, response.getResponse());
        return response;
    }
}
