package com.example.forksup.service;

import com.example.forksup.model.Recipe;
import org.springframework.ai.chat.messages.*;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.tool.ToolCallingChatOptions;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaModel;
import org.springframework.ai.ollama.api.OllamaOptions;
//import org.springframework.ai.tool.ToolCallbacks;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatBotService {

//    private static final String SYSTEM_PROMPT = """
//        You are a friendly and enthusiastic cooking assistant who loves helping people with recipes.
//
//        Your name is Chefbot
//        Users Name is {}
//
//        Your responses should be:
//        - Warm and encouraging
//        - Personal and conversational in tone
//        - Specific to the recipe being discussed
//        - Helpful and practical
//        - Brief but informative
//        - Respond in the same language as the query.
//        - Use emojis to strengthen your answer
//
//        When analyzing recipes:
//        - Be understanding and empathetic about cooking concerns
//        - Explain clearly but gently
//        - Suggest alternatives when appropriate
//        - Be supportive and confidence-building
//        - Acknowledge the cook's effort
//        - Use positive language
//
//        Remember to:
//        - Show enthusiasm for cooking
//        - Be encouraging about trying new recipes
//        - Keep responses concise but friendly
//        - Consider health and dietary aspects respectfully
//
//        Always maintain a helpful and positive tone while providing accurate information.
//        """;
//
//    private static final int MAX_HISTORY_MESSAGES = 14;
//    private final OllamaApi ollamaApi;
//    private final OllamaChatModel chatModel;
//    private final RecipeService recipeService;
//    private static final Map<String, List<Message>> sessionHistories = new ConcurrentHashMap<>();
//    private final UserService userService;
//
//    public ChatBotService(RecipeService recipeService, UserService userService) {
//        this.recipeService = recipeService;
//        this.ollamaApi = new OllamaApi();
//        this.chatModel = OllamaChatModel.builder()
//                .ollamaApi(ollamaApi)
//                .defaultOptions(
//                        OllamaOptions.builder()
//                                .toolCallbacks(ToolCallbacks.from(new ChatBotTools(recipeService, userService)))
//                                .model(OllamaModel.MISTRAL_NEMO)
//                                .temperature(0.5)
//                                .build())
//                .build();
//        this.userService = userService;
//    }
//
//    private String getUsersName(String userId) {
//        return userService.getUserByFirebaseID(userId).getDisplayName();
//    }
//
//    public Flux<String> processRequest(String message, String sessionId, String userId) {
//        String userName = getUsersName(userId);
//        String formattedSystemPrompt = SYSTEM_PROMPT.replace("{}", userName);
//
//
//        List<Message> messages = sessionHistories.computeIfAbsent(userId, k -> new LinkedList<>());
//
//        if (messages.isEmpty() || !(messages.getFirst() instanceof SystemMessage)) {
//            synchronized (messages) {
//                messages.addFirst(new SystemMessage(formattedSystemPrompt));
//            }
//        }
//
//        if (messages.size() > MAX_HISTORY_MESSAGES) {
//            messages.remove(1);
//        }
//
//        Message userMessage = new UserMessage(message);
//        synchronized (messages) {
//            messages.addLast(userMessage);
//        }
//
//        messages.forEach(message1 -> {
//            System.out.println(message1);
//        });
//
//        ChatOptions chatOptions = ToolCallingChatOptions.builder()
//                .toolContext(Map.of("sessionId", userId, "userId", userId))
//                .build();
//
//        Prompt prompt = new Prompt(messages, chatOptions);
//
//        return chatModel.stream(prompt)
//                .doOnNext(chatResponse -> {
//                    if ("returnDirect".equals(chatResponse.getResult().getMetadata().getFinishReason())) {
//                        return;
//                    } else {
//                        Message assistantMessage = new AssistantMessage(chatResponse.getResult().getOutput().getText());
//                        messages.addLast(assistantMessage);
//                    }
//                })
//                .map(chatResponse -> chatResponse.getResult().getOutput().getText());
//    }
//
//    static class ChatBotTools {
//
//        private final RecipeService recipeService;
//
//        private final UserService userService;
//
//        ChatBotTools(RecipeService recipeService, UserService userService) {
//            this.recipeService = recipeService;
//            this.userService = userService;
//
//        }
//
//        @Tool(description = "Find or search a recipe for the user", returnDirect = true)
//        public Recipe searchRecipes(
//                @ToolParam(description = "Food or recipe name") String keyword,
//                @ToolParam(description = "Tags array for the recipe") List<String> tags,
//                @ToolParam(description = "Ingredients array for the recipe") List<String> ingredients,
//                ToolContext toolContext
//        ) {
//            String sessionId = (String) toolContext.getContext().get("sessionId");
//            List<Message> messages = sessionHistories.get(sessionId);
//
//            Slice<Recipe> recipes = recipeService.searchRecipes(keyword, tags, ingredients, 0, 1);
//
//            if (!recipes.isEmpty()) {
//                Recipe recipe = recipes.getContent().getFirst();
//                Map<String, Object> recipeResponse = Map.of(
//                        "recipe id", recipe.getId(),
//                        "recipe name", recipe.getName()
//                );
//                messages.add(
//                        new ToolResponseMessage(
//                                Collections.singletonList(
//                                        new ToolResponseMessage.ToolResponse(
//                                                "",
//                                                "searchRecipes",
//                                                String.valueOf(recipeResponse)
//                                        )
//                                )
//                        )
//                );
//                return recipe;
//            }
//            return null;
//        }
//
//        @Tool(description = "Add recipe to user's favorite recipes list", returnDirect = false)
//        public String addRecipeToUserFavorites(
//                @ToolParam(description = "ID of the recipe to be saved") String recipeId,
//                ToolContext toolContext
//        ) {
//            String sessionId = (String) toolContext.getContext().get("sessionId");
//            List<Message> messages = sessionHistories.get(sessionId);
//            userService.addRecipeToFavorites(sessionId, recipeId);
//            messages.add(
//                    new ToolResponseMessage(
//                            Collections.singletonList(
//                                    new ToolResponseMessage.ToolResponse(
//                                            "",
//                                            "searchRecipes",
//                                            "Recipe added to user's favorite recipes list"
//                                    )
//                            )
//                    )
//            );
//            return "Recipe added to user's favorite recipes list";
//        }
//
//        @Tool(description = "Get Users Favorites Recipe List")
//        public List<Map<String, Object>> getUsersFavoriteRecipes(ToolContext toolContext) {
//            String sessionId = (String) toolContext.getContext().get("sessionId");
//            List<Message> messages = sessionHistories.get(sessionId);
//            List<Recipe> recipes = userService.getFavoriteRecipes(sessionId);
//            List<Map<String, Object>> favoriteRecipes = new ArrayList<>();
//            recipes.forEach(recipe -> {
//                favoriteRecipes.add(Map.of(recipe.getId(), recipe.getName()));
//            });
//            return favoriteRecipes;
//        }
//
//    }
}