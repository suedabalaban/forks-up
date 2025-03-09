package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.response.GeminiResponse;
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

    private static final String SYSTEM_INSTRUCTIONS = """
         You are a friendly and enthusiastic cooking assistant who loves helping people with recipes.
        Your responses should be:
        - If the words you are going to say contain an important context with the question, put them between **word** and double asterisks.
        - Warm and encouraging
        - Personal and conversational in tone
        - Specific to the recipe being discussed
        - Helpful and practical
        - Brief but informative
        - Respond in the same language as the query.
        
        When analyzing recipes:
        - Be understanding and empathetic about cooking concerns
        - Explain clearly but gently
        - Suggest alternatives when appropriate
        - Be supportive and confidence-building
        - Acknowledge the cook's effort
        - Use positive language
        
        Remember to:
        - Show enthusiasm for cooking
        - Be encouraging about trying new recipes
        - Keep responses concise but friendly
        - Consider health and dietary aspects respectfully
        
        Always maintain a helpful and positive tone while providing accurate information.
        """;

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

    private Recipe getRecipe(String recipeId) {
        ObjectId idObj = new ObjectId(recipeId);
        return recipeRepository.findById(idObj)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));
    }

    private GeminiResponse sendGeminiRequest(String prompt, String systemInstructions) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("role", "system");
        systemInstruction.put("parts", Collections.singletonList(Map.of("text", systemInstructions)));
        requestBody.put("systemInstruction", systemInstruction);

        //user prompt
        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", Collections.singletonList(Map.of("text", prompt)));
        requestBody.put("contents", Collections.singletonList(userContent));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.9); // Adjust creativity
        generationConfig.put("topP", 0.9); // Adjust diversity
        generationConfig.put("maxOutputTokens", 1024); // Limit response length
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "?key=" + apiKey,
                    HttpMethod.POST,
                    request,
                    Map.class
            );
            //Parse the response
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            // Extract the text response
            String responseText = (String) parts.get(0).get("text");
            return new GeminiResponse(responseText.trim());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("Failed to process Gemini API response: " + e.getMessage());
        }
    }

    public GeminiResponse analyzeRecipe(String recipeId, String question) {
        String cacheKey = recipeId + "-" + question.toLowerCase().trim();

        String cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse != null) {
            return new GeminiResponse(cachedResponse);
        }

        Recipe recipe = getRecipe(recipeId);
        String prompt = new RecipePromptBuilder(recipe, question).build();

        GeminiResponse response = sendGeminiRequest(prompt, SYSTEM_INSTRUCTIONS);
        responseCache.put(cacheKey, response.getResponse());
        return response;
    }

    public List<String> getPredefinedQuestions() {
        return List.of(
                "Is this recipe suitable for a vegan diet?",
                "Is this recipe suitable for a vegetarian diet?",
                "Is this recipe suitable for a diet?",
                "How many calories does this recipe contain?",
                "What is the cooking time for this recipe?",
                "What are the alternative ingredients for this recipe?"
        );
    }

    public String generateRecipeQuestions(String recipeId){
        Recipe recipe = getRecipe(recipeId);
        String prompt = new RecipePromptBuilder(recipe, "Generate three specific questions users might ask about" +
                "this recipe. Seperate questions by '|.'").build();

        String systemInstructions = """
        You are a recipe analysis assistant. Generate three concise and specific questions about the given recipe. Follow these rules:
    - Each question should be short and to the point (maximum 15 words).
    - Focus on key aspects of the recipe:
      - Dietary suitability
      - Cooking techniques
      - Ingredient substitutions
      - Nutritional information
      - Preparation time
      - Serving suggestions
    - Avoid unnecessary details or explanations.
    - Format: question1|question2|question3""";

        GeminiResponse response = sendGeminiRequest(prompt, systemInstructions);
        List<String> questions = Arrays.stream(response.getResponse().split("\\|"))
                .map(String::trim)
                .limit(3)
                .toList();
        // Format the response with questions in double quotes
        return String.format(
                "Current Recipe: %s\nI can help you with your questions:\n- \"%s\"\n- \"%s\"\n- \"%s\"\nWhat would you like to know?",
                recipe.getName(),
                questions.get(0),
                questions.get(1),
                questions.get(2)
        );
    }
}