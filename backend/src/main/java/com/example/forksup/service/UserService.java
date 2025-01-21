package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.IngredientRepository;
import com.example.forksup.repository.recipe.RecipeRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private RestTemplate restTemplate;

    public User getUserById(String id) {
        ObjectId idObj = new ObjectId(id);
        User u = userRepository.findById(idObj).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u;
    }

    public User getUserByFirebaseID(String firebaseId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u;
    }

    public User insertUser(User user) {
        User u = userRepository.findUserByFirebaseId(user.getFirebaseId()).orElse(null);
        if (u != null) {
            return null;
        }
        u = userRepository.insert(user);
        return u;
    }

    public void addRecipeToFavorites(String firebaseId, String recipeId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe r = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        if (u.getFavorites() == null) {
            u.setFavorites(new ArrayList<Recipe>());
        }
        if (!u.getFavorites().contains(r)) {
            u.getFavorites().add(r);
            userRepository.save(u);
        }
    }

    public void removeRecipeFromFavorites(String firebaseId, String recipeId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe r = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        u.getFavorites().remove(r);
        userRepository.save(u);
    }

    public List<Recipe> getFavoriteRecipes(String firebaseId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u.getFavorites();
    }

    public boolean isRecipeInFavorites(String firebaseId, String recipeId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        if (u.getFavorites() == null) {return false;}
        Recipe r = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        return u.getFavorites().contains(r);
    }

    public List<PantryItem> getUserPantryItems(String firebaseId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u.getPantryItems();
    }

    public void addIngredientToPantry(String firebaseId, String ingredientId, Integer quantity, String unit) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null) {
            u.setPantryItems(new ArrayList<>());
        }
        List<PantryItem> pantryItems = u.getPantryItems();
        PantryItem existingPantryItem = pantryItems.stream()
                .filter(item -> item.getIngredient().getId().equals(i.getId()))
                .findFirst()
                .orElse(null);

        if (existingPantryItem == null) {
            PantryItem newPantryItem = new PantryItem();
            newPantryItem.setIngredient(i);
            newPantryItem.setQuantity(quantity);
            newPantryItem.setMeasurementUnit(unit);
            pantryItems.add(newPantryItem);
        } else {
            existingPantryItem.setQuantity(quantity);
        }
        u.setPantryItems(pantryItems);
        userRepository.save(u);
    }

    public PantryItem updateIngredientQuantity(String firebaseId, String ingredientId, Integer quantity, String unit) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null) {
            throw new ResourceNotFoundException("Pantry is empty");
        }
        PantryItem pantryItem = u.getPantryItems().stream()
                .filter(item -> item.getIngredient().getId().equals(i.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found in pantry"));
        pantryItem.setQuantity(quantity);
        pantryItem.setMeasurementUnit(unit);

        userRepository.save(u);
        return pantryItem;
    }

    public void removeIngredientFromPantry(String firebaseId, String ingredientId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null || u.getPantryItems().isEmpty()) {
            throw new ResourceNotFoundException("Pantry is empty");
        }
        boolean removed = u.getPantryItems().removeIf(item -> item.getIngredient().getId().equals(i.getId()));
        if (!removed) {
            throw new ResourceNotFoundException("Ingredient not found in pantry");
        }
        userRepository.save(u);
    }

    public List<RecipeHistory> getRecipeHistory(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return user.getRecipeHistory();
    }

    public void addItemToRecipeHistory(String firebaseId, String recipeId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe recipe = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        if (user.getRecipeHistory() == null) {
            user.setRecipeHistory(new ArrayList<RecipeHistory>());
        }
        if(!user.getRecipeHistory().contains(recipe)) {
            RecipeHistory recipeHistoryItem = new RecipeHistory(recipe);
            user.getRecipeHistory().add(recipeHistoryItem);
            userRepository.save(user);
        }
    }

    public void removeItemFromRecipeHistory(String firebaseId, String recipeId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe recipe = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        if (user.getRecipeHistory() != null) {
            user.getRecipeHistory().removeIf(historyItem -> 
                historyItem.getRecipe().getId().equals(recipe.getId())
            );
            userRepository.save(user);
        }
    }

    public boolean isItemInRecipeHistory(String firebaseId, String recipeId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        if(user.getRecipeHistory() == null) {return false;}
        Recipe recipe = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        return user.getRecipeHistory().stream()
                .anyMatch(historyItem -> historyItem.getRecipe().getId().equals(recipe.getId()));
    }

    public Preferences getUserPreferences(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return user.getPreferences();
    }

    public void updatePantryAfterRecipe(String firebaseId, List<String> ingredientIds) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );

        if(ingredientIds != null && !ingredientIds.isEmpty()) {
            for(String ingredientId : ingredientIds) {
                removeIngredientFromPantry(firebaseId, ingredientId);
            }
            userRepository.save(user);
        }
    }

    public RecipeHistory getLastRecipeHistory(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        
        if (user.getRecipeHistory() == null || user.getRecipeHistory().isEmpty()) {
            return null;
        }
        
        // En son eklenen tarifi döndür - tmm
        return user.getRecipeHistory().get(user.getRecipeHistory().size() - 1);
    }

    public void uploadAvatar(String firebaseId, MultipartFile avatar) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        if (avatar != null && !avatar.isEmpty()) {
            try {
                user.setAvatar(avatar.getBytes());
                userRepository.save(user);
            } catch (IOException e) {
                throw new RuntimeException("Error processing the upload file", e);
            }
        } else {
            throw new IllegalArgumentException("Avatar file is empty or null.");
        }
    }

    public void getAvatar(String firebaseId){
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        user.getAvatar();
    }

    public void updateDescription(String firebaseId, String description) {
        if (description.length() > 200) {
            throw new IllegalArgumentException("Description cannot exceed 200 characters.");
        }
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        user.setDescription(description);
        userRepository.save(user);
    }

    public User generateAvatar(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        String prompt = user.getDescription();
        
        String encodedPrompt = UriUtils.encode(prompt, StandardCharsets.UTF_8);
        
        String url = "https://image.pollinations.ai/prompt/" + encodedPrompt +
                     "?model=flux-pro&safe=true&private=true&width=184&height=184&nologo=true";

        try {
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                user.setAvatar(response.getBody());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("Failed to generate avatar: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error generating avatar: " + e.getMessage(), e);
        }
    }
}
