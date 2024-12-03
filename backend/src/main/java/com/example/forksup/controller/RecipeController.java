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
        String firebaseId = request.getHeader("X-Firebase-Id");
        
        try {
            Page<Recipe> recipes;
            
            if (keyword != null && tags != null && firebaseId != null) {
                recipes = recipeService.searchRecipesByKeywordTagsAndPantryItems(firebaseId, keyword, tags, page, size);
            }
            else if (keyword != null && tags != null) {
                recipes = recipeService.searchRecipesByKeywordAndTags(keyword, tags, page, size);
            }
            else if (keyword != null && tags == null) {
                recipes = recipeService.searchRecipesByKeyword(keyword, page, size);
            }
            else if (keyword == null && tags != null) {
                recipes = recipeService.searchRecipesByTags(tags, page, size);
            }
            else {
                return ResponseEntity.badRequest()
                    .body(Page.empty());
            }
            
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Page.empty());
        }
    }

    @GetMapping("/searchByTags")
    public ResponseEntity<Page<Recipe>> searchRecipesWithTags(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Page<Recipe> recipes  = recipeService.searchRecipesByKeywordAndTags(keyword, tags, page, size);
        return new ResponseEntity<>(recipes, HttpStatus.OK);
    }
    @GetMapping("searchByTagsAndPantry")
    public ResponseEntity<Page<Recipe>> searchRecipesWithTagsAndPantry(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ){
        String firebaseId = request.getHeader("X-Firebase-Id");
        if (firebaseId == null || firebaseId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Page<Recipe> recipes = recipeService.searchRecipesByKeywordTagsAndPantryItems(firebaseId, keyword, tags, page, size);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("searchByIngredients")
    public ResponseEntity<Page<Recipe>> searchRecipesWithIngredients(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ){
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        if (firebaseToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Page<Recipe> recipes = recipeService.searchRecipesByPantryItems(firebaseToken.getUid(), page, size);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}