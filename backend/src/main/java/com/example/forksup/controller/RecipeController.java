package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes/")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    // Find recipe by their ObjectId
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable("id") String id) {
        ObjectId idObj = new ObjectId(id);
        Recipe r = recipeRepository.findById(idObj).orElse(null);
        if (r == null) {
            new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(r, null, HttpStatus.OK);
    }
}
