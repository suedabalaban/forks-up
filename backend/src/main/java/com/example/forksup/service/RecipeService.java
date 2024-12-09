package com.example.forksup.service;

import com.example.forksup.model.*;
import com.example.forksup.repository.IngredientRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.forksup.repository.RecipeRepository;

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

    @Cacheable(value = "recipeSearchCache",
            key = "#keyword + #page + #size",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByKeyword(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String searchText = Arrays.stream(keyword.trim().split("\\s+"))
                .map(word -> "\"" + word + "\"")
                .collect(Collectors.joining(" "));

        List<Recipe> recipes = recipeRepository.findByNameTextSearch(searchText, pageable);
        long total = recipeRepository.countByNameTextSearch(searchText);
        return new PageImpl<>(recipes, pageable, total);
    }

    @Cacheable(value = "recipeSearchCache",
            key = "#keyword + #tags + #page + #size",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByKeywordAndTags(String keyword, List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String searchText = keyword == null || keyword.trim().isEmpty() ? "" :
                Arrays.stream(keyword.trim().split("\\s+"))
                        .map(word -> "\"" + word + "\"")
                        .collect(Collectors.joining(" "));
        List<Recipe> recipes;
        long total;

        if (tags == null || tags.isEmpty()) {
            recipes = recipeRepository.findByNameTextSearch(searchText, pageable);
            total = recipeRepository.countByNameTextSearch(searchText);
        } else {
            recipes = recipeRepository.findByNameAndTags(searchText, tags, pageable);
            total = recipeRepository.countByNameAndTags(searchText, tags);
        }
        return new PageImpl<>(recipes, pageable, total);
    }

    @Cacheable(value = "recipeSearchCache",
            key = "#tags",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByTags(List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        List<Recipe> recipes = recipeRepository.findByTagsIn(tags, pageable);
        long total = recipeRepository.countByTags(tags);
        return new PageImpl<>(recipes, pageable, total);
    }


    @Cacheable(value = "recipeSearchCache",
            key = "#keyword + #tags + #page + #size",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByKeywordTagsAndPantryItems(
            String firebaseId, String keyword, List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<PantryItem> pantryItems = userService.getUserPantryItems(firebaseId);

        List<ObjectId> ingredientIds = pantryItems.stream()
                .map(item -> item.getIngredient().getObjectId())
                .collect(Collectors.toList());

        String searchText = keyword == null || keyword.trim().isEmpty() ? "" :
                Arrays.stream(keyword.trim().split("\\s+"))
                        .map(word -> "\"" + word + "\"")
                        .collect(Collectors.joining(" "));

        List<Recipe> recipes;
        long total;

        recipes = recipeRepository.findByNameTagsAndIngredients(searchText, tags, ingredientIds, pageable);
        total = recipeRepository.countByNameTagsAndIngredients(searchText, tags, ingredientIds);

        return new PageImpl<>(recipes, pageable, total);
    }
    @Cacheable(value = "recipeSearchCache",
            key = "{#firebaseId, #page, #size}",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByPantryItems(String firebaseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<PantryItem> pantryItems = userService.getUserPantryItems(firebaseId);
        
        List<ObjectId> ingredientIds = pantryItems.stream()
                .map(item -> item.getIngredient().getObjectId())
                .collect(Collectors.toList());
        
        List<Recipe> recipes = recipeRepository.findByIngredientsIn(ingredientIds, pageable);
        long total = recipeRepository.countByIngredients(ingredientIds);

        return new PageImpl<>(recipes, pageable, total);
    }

    public Page<Recipe> searchRecipesByUserPreferences(String keyword, String firebaseId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        List<PantryItem> pantryItems = userService.getUserPantryItems(firebaseId);
        Preferences preferences = userService.getUserPreferences(firebaseId);
        
        List<ObjectId> ingredientIds = new ArrayList<>();
        if (pantryItems != null && !pantryItems.isEmpty()) {
            ingredientIds = pantryItems.stream()
                    .filter(item -> item.getIngredient() != null)
                    .map(item -> item.getIngredient().getObjectId())
                    .filter(Objects::nonNull)
                    .toList();
        }

        if (preferences != null) {
            List<String> cuisines = preferences.getCuisines();
            List<String> otherPreferences = new ArrayList<>();

            DietaryRestrictions dietaryRestrictions = preferences.getDietaryRestrictions();
            if(dietaryRestrictions != null) {
                if(dietaryRestrictions.getHealthConscious() != null){
                    otherPreferences.addAll(dietaryRestrictions.getHealthConscious());
                }
                if(dietaryRestrictions.getLifestyle() != null){
                    otherPreferences.addAll(dietaryRestrictions.getLifestyle());
                }
                if(dietaryRestrictions.getAllergiesIntolerances() != null){
                    otherPreferences.addAll(dietaryRestrictions.getAllergiesIntolerances());
                }
            }
            if(preferences.getPreparation_time() != null) {
                otherPreferences.add(preferences.getPreparation_time());
            }

            String searchText = keyword == null || keyword.trim().isEmpty() ? "" :
                    Arrays.stream(keyword.trim().split("\\s+"))
                            .map(word -> "\"" + word + "\"")
                            .collect(Collectors.joining(" "));

            List<Recipe> recipes;
            long total;
            
            if (cuisines == null) {
                cuisines = new ArrayList<>();
            }
            
            recipes = recipeRepository.findByPreferences(
                    searchText, cuisines, otherPreferences, pageable);
            total = recipeRepository.countByPreferences(
                    searchText, cuisines, otherPreferences);
            
            return new PageImpl<>(recipes, pageable, total);
        }
        
        return Page.empty(pageable);
    }
}