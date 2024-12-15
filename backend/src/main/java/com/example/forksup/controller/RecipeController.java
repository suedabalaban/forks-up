package com.example.forksup.controller;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.RecipeService;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.http.HttpServlet;
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        String uid = (String) request.getSession().getAttribute("uid");

        Page<Recipe> recipes;

        if (keyword != null && tags != null && uid.isEmpty()) {
            recipes = recipeService.searchRecipesByKeywordAndTags(keyword, tags, page, size);
        }
        else if (keyword != null && tags != null ) {
            recipes = recipeService.searchRecipesByKeywordTagsAndPantryItems(uid,keyword, tags, page, size);
        }
        else if (keyword != null && tags == null) {
            recipes = recipeService.searchRecipesByKeyword(keyword, page, size);
        }
        else if (keyword == null && tags != null) {
            recipes = recipeService.searchRecipesByTags(tags, page, size);
        }
        else {
            recipes = recipeService.searchRecipesByPantryItems(uid, page, size);
        }
        return ResponseEntity.ok(recipes);

    }

    @GetMapping("/preferences")
    public ResponseEntity<Page<Recipe>> searchRecipesByPreferences(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String uid = (String) request.getSession().getAttribute("uid");
        if (uid == null) {
            return new ResponseEntity<>(null, null, HttpStatus.UNAUTHORIZED);
        }

        Page<Recipe> recipes = recipeService.searchRecipesByUserPreferences(
                keyword != null ? keyword : "", uid, page, size);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/searchPantry")
    public ResponseEntity<Page<Recipe>> searchRecipesByPantryItems(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String uid = (String) request.getSession().getAttribute("uid");
        if (uid == null) {
            return new ResponseEntity<>(null, null, HttpStatus.UNAUTHORIZED);
        }

        Page<Recipe> recipes = recipeService.searchRecipesByPantryItems(uid, page, size);
        return ResponseEntity.ok(recipes);
    }

}