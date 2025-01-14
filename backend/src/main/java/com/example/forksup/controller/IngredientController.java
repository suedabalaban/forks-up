package com.example.forksup.controller;

import com.example.forksup.model.Ingredient;
import com.example.forksup.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    @Autowired
    private IngredientRepository ingredientRepository;

    /**
     * Performs an intelligent search for ingredients based on user input.
     * This endpoint implements a relevance-based search that:
     * - Matches ingredients by name, description, or common aliases
     * - Returns results sorted by relevance to the search keyword
     * - Helps users find ingredients even with partial or approximate matches
     *
     * @param keyword The search term to match against ingredients
     * @return ResponseEntity containing:
     *         - List of matching Ingredient objects sorted by relevance
     *         - Empty list if no matches found
     */
    @GetMapping("/search")
    public ResponseEntity<List<Ingredient>> searchIngredients(@RequestParam String keyword) {
        List<Ingredient> ingredients = ingredientRepository.findByKeywordSortedByRelevance(keyword);
        return ResponseEntity.ok(ingredients);
    }

}