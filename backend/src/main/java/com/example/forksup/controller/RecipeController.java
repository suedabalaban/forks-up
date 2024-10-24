package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.RecipeService;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes/")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeService recipeService;

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable("id") String id) {
        if (id == null || id.length() != 24) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        try {
            ObjectId idObj = new ObjectId(id);
            Recipe recipe = recipeRepository.findById(idObj).orElse(null);

            if (recipe == null) {
                return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(recipe, null, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
    }
    //mongodb üzerinde name değişkeninde text index oluşturarak ve @Query kullanarak yapılan arama 
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<Recipe>> searchRecipes(@PathVariable String keyword){
            final int limit = 10;
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
            }
            
            List<Recipe> recipes = recipeService.searchRecipesByName(keyword, limit);
            
            if (recipes.isEmpty()) {
                return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
            }
            
            return new ResponseEntity<>(recipes, null, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    //Criteria sınıfının regex() fonksiyonu kullanılarak yapılan arama
    @GetMapping("/search-regex/{keyword}")
public ResponseEntity<List<Recipe>> searchRecipesRegex(@PathVariable String keyword) {
    try {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        
        List<Recipe> recipes = recipeService.searchRecipesByNameRegex(keyword);
        
        if (recipes.isEmpty()) {
            return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        
        return new ResponseEntity<>(recipes, null, HttpStatus.OK);
    } catch (Exception e) {
        return new ResponseEntity<>(null, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}