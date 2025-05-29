package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.response.GeminiResponse;
import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.prompt.RecipePromptBuilder;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GeminiService {
    private static final String SYSTEM_INSTRUCTIONS = """
        You are a friendly and enthusiastic cooking assistant who loves helping people with recipes.
        
        Your responses should be:
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

    @Autowired
    private RecipeService recipeService;

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

    private Map<String, Object> createGeminiRequest(String prompt, String systemInstructions, Map<String, Object> functionDeclaration) {
        Map<String, Object> requestBody = new HashMap<>();

        // Add system instructions
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("role", "system");
        systemInstruction.put("parts", Collections.singletonList(Map.of("text", systemInstructions)));
        requestBody.put("systemInstruction", systemInstruction);

        // Add user prompt
        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", Collections.singletonList(Map.of("text", prompt)));
        requestBody.put("contents", Collections.singletonList(userContent));

        // Add function declaration if provided
        if (functionDeclaration != null) {
            Map<String, Object> tool = new HashMap<>();
            tool.put("functionDeclarations", Collections.singletonList(functionDeclaration));
            requestBody.put("tools", Collections.singletonList(tool));
        }

        // Add generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.9);
        generationConfig.put("topP", 0.9);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    private GeminiResponse sendGeminiRequest(String prompt, String systemInstructions, Map<String, Object> functionDeclaration) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = createGeminiRequest(prompt, systemInstructions, functionDeclaration);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        try {
            long startTime = System.currentTimeMillis();

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "?key=" + apiKey,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            System.out.println("Geçen süre: " + duration + " ms");

            // Parse the response
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            // Check if the response contains a function call
            if (parts.get(0).containsKey("functionCall")) {
                Map<String, Object> functionCall = (Map<String, Object>) parts.get(0).get("functionCall");
                return new GeminiResponse(functionCall); // Return function call
            }

            // Otherwise, return the text response
            String responseText = ((String) parts.get(0).get("text")).trim();
            return new GeminiResponse(responseText); // Return text response
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("Failed to process Gemini API response: " + e.getMessage());
        }
    }
    //overload sendGeminiRequest for non-function-call purposes
    private GeminiResponse sendGeminiRequest(String prompt, String systemInstructions) {
        return sendGeminiRequest(prompt, systemInstructions, null); // Call the three-parameter version
    }

    public GeminiResponse analyzeRecipe(String recipeId, String question) {
        if (recipeId.trim().equals("no-recipe")) {
            return sendGeminiRequest(question, SYSTEM_INSTRUCTIONS);
        }

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

    public String generateRecipeQuestions(String recipeId){
        Recipe recipe = getRecipe(recipeId);
        String prompt = new RecipePromptBuilder(recipe, "Generate three specific questions users might ask about" +
                "this recipe. Seperate questions by '|.'").build();

        String systemInstructions = """
         You are a recipe analysis assistant. Generate three concise and specific questions about the given recipe. Follow these rules:
                - Each question should be short and to the point (maximum 15 words).
                - Include an appropriate food category emoji (icon) at the beginning of your response. For example:
                         - 🍲 for soups
                         - 🍕 for pizzas
                         - 🍰 for desserts
                         - Use your best judgment for other categories.
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
        if (questions.size() < 3) {
            throw new IllegalStateException("Gemini API did not generate enough questions.");
        }

        // Format the response with questions in double quotes
        return String.format(
                "Current Recipe: %s\nI can help you with your questions:\n- \"%s\"\n- \"%s\"\n- \"%s\"\nWhat would you like to know?",
                recipe.getName(),
                questions.get(0),
                questions.get(1),
                questions.get(2)
        );
    }

    public Map<String, Object> getSearchFunctionDeclaration() {
        Map<String, Object> functionDeclaration = new HashMap<>();
        functionDeclaration.put("name", "searchRecipes");
        functionDeclaration.put("description", "Search recipes using keywords, tags, and ingredients.");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("type", "object");
        parameters.put("properties", Map.of(
                "keyword", Map.of("type", "string", "description", "Search term for recipe names/descriptions"),
                "tags", Map.of("type", "array", "items", Map.of("type", "string"), "description", "Recipe tags"),
                "ingredients", Map.of("type", "array", "items", Map.of("type", "string"), "description", "Ingredients")
        ));
        parameters.put("required", Collections.emptyList());

        functionDeclaration.put("parameters", parameters);
        return functionDeclaration;
    }

    public Slice<Recipe> naturalLanguageSearch(String userQuery, int page, int size) {
        Map<String, Object> functionDeclaration = getSearchFunctionDeclaration();

        GeminiResponse response = sendGeminiRequest(
                userQuery,
                "Analyze the user's query and extract search parameters for recipes.",
                functionDeclaration
        );

        if (response.isFunctionCall()) {
            Map<String, Object> functionCall = response.getFunctionCall();
            if ("searchRecipes".equals(functionCall.get("name"))) {
                Map<String, Object> args = (Map<String, Object>) functionCall.get("args");
                System.out.println("searchRecipes called with this args: " + args.toString());

                return recipeService.searchRecipes(
                        (String) args.getOrDefault("keyword", ""),
                        (List<String>) args.getOrDefault("tags", Collections.emptyList()),
                        (List<String>) args.getOrDefault("ingredients", Collections.emptyList()),
                        page,
                        size
                );
            }
        }

        throw new IllegalStateException("Gemini API did not return a valid function call.");
    }

    public List<String> streamTextCompletions(String userInput) {
        String prompt = """
            Act as an autocomplete system. Return exactly 3 recipe-related completions for: %s
            Rules:
            - Each completion must start with the given input text exactly
            - Return ONLY the completions, one per line
            - No explanations or additional text
            - Keep completions under 50 characters
            - Must be about food, cooking, or recipes
            - No numbering or bullet points""".formatted(userInput);

        GeminiResponse response = sendGeminiRequest(prompt, SYSTEM_INSTRUCTIONS);
        
        return Arrays.stream(response.getResponse().split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .filter(s -> s.toLowerCase().startsWith(userInput.toLowerCase()))
                .distinct()
                .limit(3)
                .collect(Collectors.toList());
    }

}