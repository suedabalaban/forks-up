package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.recipe.RecipeRepository;
import com.example.forksup.service.RecipeService;

import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
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

    @GetMapping("/search")
    public ResponseEntity<Page<Recipe>> searchRecipesRegex(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        String uid = (String) request.getSession().getAttribute("uid");

        Page<Recipe> recipes = recipeService.searchRecipes(keyword, tags, ingredients, page, size);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/preferences")
    public ResponseEntity<Page<Recipe>> searchRecipesByPreferences(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {

        String uid = (String) request.getSession().getAttribute("uid");
        if (uid == null) {
            return new ResponseEntity<>(null, null, HttpStatus.UNAUTHORIZED);
        }
        Page<Recipe> recipes = recipeService.searchRecipesByPreferences(uid, keyword, tags, ingredients, page, size);
        return ResponseEntity.ok(recipes);
    }

}