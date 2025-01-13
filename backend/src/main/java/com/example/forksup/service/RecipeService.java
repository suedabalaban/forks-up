package com.example.forksup.service;

import com.example.forksup.model.*;
import com.example.forksup.repository.IngredientRepository;
import com.example.forksup.repository.recipe.RecipeRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    public Page<Recipe> searchRecipes(
            String keyword,
            List<String> tags,
            List<String> ingredients,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        List<Ingredient> ingredientIds = null;
        if (ingredients != null && !ingredients.isEmpty()) {
            ingredientIds = ingredientRepository.findIngredientsByNameIn(ingredients);
        }
        return recipeRepository.searchRecipes(keyword, tags, ingredientIds, null, pageable);
    }

    public Page<Recipe> searchRecipesByPreferences(
            String uid,
            String keyword,
            List<String> tags,
            List<String> ingredients,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        List<Ingredient> ingredientIds = new ArrayList<>();
        if (ingredients != null && !ingredients.isEmpty()) {
            ingredientIds = ingredientRepository.findIngredientsByNameIn(ingredients);
        }

        List<PantryItem> pantryItems = userService.getUserPantryItems(uid);
        Preferences preferences = userService.getUserPreferences(uid);

        if (pantryItems != null && !pantryItems.isEmpty()) {
            ingredientIds.addAll(pantryItems.stream()
                    .map(PantryItem::getIngredient)
                    .toList());
        }

        List<String> otherTags = new ArrayList<>();
        List<String> cuisineTags = new ArrayList<>();

        if (tags != null) {
            otherTags.addAll(tags);
        }

        if (preferences != null) {
            if (preferences.getDietaryRestrictions() != null) {
                DietaryRestrictions restrictions = preferences.getDietaryRestrictions();

                if (restrictions.getHealthConscious() != null) {
                    otherTags.addAll(restrictions.getHealthConscious());
                }

                if (restrictions.getAllergiesIntolerances() != null) {
                    otherTags.addAll(restrictions.getAllergiesIntolerances());
                }

                if (restrictions.getLifestyle() != null) {
                    otherTags.addAll(restrictions.getLifestyle());
                }
            }

            if (preferences.getCuisines() != null) {
                cuisineTags.addAll(preferences.getCuisines());
            }
        }

        return recipeRepository.searchRecipesWithPreferences(
                keyword,
                cuisineTags,
                otherTags,
                ingredientIds,
                null,
                pageable
        );
    }

}