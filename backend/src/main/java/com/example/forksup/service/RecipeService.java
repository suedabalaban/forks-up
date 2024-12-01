package com.example.forksup.service;

import com.example.forksup.model.Ingredient;
import com.example.forksup.repository.IngredientRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

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

    public List<String> getAllUniqueTags() {
        return recipeRepository.findDistinctTags();
    }

    @Cacheable(value = "recipeSearchCache",
            key = "#keyword + #tags + #pantryItemNames + #page + #size",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByKeywordTagsAndPantryItems(
            String keyword, List<String> tags, List<String> pantryItemNames, int page, int size) {

        System.out.println("Service layer - Processing search with:");
        System.out.println("Keyword: " + keyword);
        System.out.println("Tags: " + tags);
        System.out.println("Pantry Items: " + pantryItemNames);

        Pageable pageable = PageRequest.of(page, size);

        String searchText = keyword == null || keyword.trim().isEmpty() ? "" :
                Arrays.stream(keyword.trim().split("\\s+"))
                        .map(word -> "\"" + word + "\"")
                        .collect(Collectors.joining(" "));

        System.out.println("Processed search text: " + searchText);

        List<ObjectId> ingredientIds = new ArrayList<>();
        if (pantryItemNames != null && !pantryItemNames.isEmpty()) {
            ingredientIds = ingredientRepository.findByNameIn(pantryItemNames)
                    .stream()
                    .map(Ingredient::getObjectId)
                    .collect(Collectors.toList());
            System.out.println("Found ingredient IDs: " + ingredientIds);
        }

        List<Recipe> recipes;
        long total;

        recipes = recipeRepository.findByNameTagsAndIngredients(searchText, tags, ingredientIds, pageable);
        total = recipeRepository.countByNameTagsAndIngredients(searchText, tags, ingredientIds);

        System.out.println("Found " + total + " recipes in total");
        System.out.println("Returning " + (recipes != null ? recipes.size() : 0) + " recipes for current page");

        return new PageImpl<>(recipes, pageable, total);
    }
}