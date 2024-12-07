package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.IngredientRepository;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public User getUserById(String id) {
        ObjectId idObj = new ObjectId(id);
        User u = userRepository.findById(idObj).orElseThrow(() ->
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

    public void addIngredientToPantry(String firebaseId, String ingredientId, Integer quantity) {
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
            pantryItems.add(newPantryItem);
        } else {
            existingPantryItem.setQuantity(existingPantryItem.getQuantity() + quantity);
        }
        u.setPantryItems(pantryItems);
        userRepository.save(u);
    }

    public PantryItem updateIngredientQuantity(String firebaseId, String ingredientId, Integer quantity) {
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

}
