package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.repository.ReviewRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
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

    private final UserRepository userRepository;

    private final RecipeRepository recipeRepository;

    private final RestTemplate restTemplate;

    private final ReviewRepository reviewRepository;

    UserService(
            UserRepository userRepository,
            RecipeRepository recipeRepository,
            RestTemplate restTemplate,
            ReviewRepository reviewRepository
    ) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.restTemplate = restTemplate;
        this.reviewRepository = reviewRepository;
    }

    public User getUserById(String id) {
        return userRepository.findById(new ObjectId(id)).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
    }

    public User getUserByFirebaseID(String firebaseId) {
        return userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
    }

    public User updateUser(User user) {
        return userRepository.save(user);
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

    public User addUserPreferences(String firebaseId, Preferences preferences) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        user.setPreferences(preferences);
        userRepository.save(user);
        return user;
    }

    public Preferences getUserPreferences(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return user.getPreferences();
    }

    public RecipeHistory getLastRecipeHistory(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        
        if (user.getRecipeHistory() == null || user.getRecipeHistory().isEmpty()) {
            return null;
        }
        
        return user.getRecipeHistory().getLast();
    }

    public byte[] getAvatar(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return user.getAvatar();
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

    public void addDescription(String firebaseId, String description) {
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
                     "?model=flux-pro&safe=true&private=true&width=216&height=216&nologo=true";

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
