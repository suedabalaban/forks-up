package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.RecipeRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserService userService;

    public Recipe getByRecipeId(String id) {
        return recipeRepository.findById(new ObjectId(id)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
    }

    public Slice<Recipe> searchRecipes(
            String keyword,
            List<String> tags,
            List<String> ingredients,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        String combinedText = combineSearchParameters(keyword, tags, ingredients);
        int minScore = (int) combinedText.chars().filter(ch -> ch == ' ').count() * 7 + 20;
        return recipeRepository.searchRecipesAdvanced(combinedText, minScore, pageable);
    }

    public Slice<Recipe> searchRecipesByPreferences(
            String uid,
            String keyword,
            List<String> tags,
            List<String> ingredients,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (ingredients == null) {
            ingredients = new ArrayList<>();
        }

        if (tags == null) {
            tags = new ArrayList<>();
        }

        List<PantryItem> pantryItems = userService.getUserPantryItems(uid);
        Preferences preferences = userService.getUserPreferences(uid);

        if (pantryItems != null && !pantryItems.isEmpty()) {
            ingredients.addAll(pantryItems.stream()
                    .map(PantryItem::getIngredient)
                    .map(Ingredient::getName)
                    .toList());
        }

        if (preferences != null) {
            if (preferences.getDietaryRestrictions() != null) {
                DietaryRestrictions restrictions = preferences.getDietaryRestrictions();

                if (restrictions.getHealthConscious() != null) {
                    tags.addAll(restrictions.getHealthConscious());
                }

                if (restrictions.getAllergiesIntolerances() != null) {
                    tags.addAll(restrictions.getAllergiesIntolerances());
                }

                if (restrictions.getLifestyle() != null) {
                    tags.addAll(restrictions.getLifestyle());
                }
            }

            if (preferences.getCuisines() != null) {
                tags.addAll(preferences.getCuisines());
            }
        }

        String combinedText = combineSearchParameters(keyword, tags, ingredients);
        int minScore = (int) combinedText.chars().filter(ch -> ch == ' ').count() * 7 + 20;
        return recipeRepository.searchRecipesAdvanced(combinedText, minScore,pageable);
    }

    private String combineSearchParameters(String keyword, List<String> tags, List<String> ingredients) {
        StringBuilder combinedText = new StringBuilder();

        if (keyword != null && !keyword.trim().isEmpty()) {
            combinedText.append(keyword.trim()).append(" ");
        }

        if (tags != null) {
            for (String tag : tags) {
                if (tag != null && !tag.trim().isEmpty()) {
                    combinedText.append(tag.trim()).append(" ");
                }
            }
        }

        if (ingredients != null) {
            for (String ingredient : ingredients) {
                if (ingredient != null && !ingredient.trim().isEmpty()) {
                    combinedText.append(ingredient.trim()).append(" ");
                }
            }
        }

        return combinedText.toString().trim();
    }

}