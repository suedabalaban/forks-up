package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    // Find recipe by their ObjectId
    @GetMapping("/{id}")
    public Recipe getRecipeById(@PathVariable("id") ObjectId id) {
        Recipe recipe = recipeRepository.findById(id).orElse(null);
        if (recipe == null) {
            throw new RuntimeException("Tarif bulunamadı!");
        }
        return recipe;
    }

}
