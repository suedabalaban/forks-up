package com.example.forksup.service;

import com.example.forksup.model.GeminiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import java.io.*;

/**
 * Service class for interacting with the Gemini API.
 */
@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate ;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    public GeminiResponse analyzeText(String text){
        // Set the API key and URL
        String apiKey = this.apiKey;
        String apiUrl = this.apiUrl;

        // Create headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request body
        Map<String, Object> part = new HashMap<>();
        part.put("text", text);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        // Debug: Print the request body
        ObjectMapper mapper = new ObjectMapper();
        try {
            System.out.println("Request Body: " + mapper.writeValueAsString(requestBody));
        } catch (Exception e) {
            e.printStackTrace();
        }

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

        // Return the result
        return new GeminiResponse(generatedText);
    }
}
