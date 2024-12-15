package com.example.forksup.controller;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.UserRepository;
import com.example.forksup.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping(path = "/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        User u =  userService.getUserById(id);
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(u, null, HttpStatus.OK);
    }

    @PutMapping(path = "")
    public ResponseEntity<String> saveUser(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        User u = userService.insertUser(new User(
                null,
                uid,
                null,
                null,
                null)
        );
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @GetMapping("/favorite/{recipeId}")
    public ResponseEntity<Boolean> isRecipeInFavorites(HttpServletRequest request, @PathVariable String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        boolean isFavorite = userService.isRecipeInFavorites(uid, recipeId);
        return ResponseEntity.ok(isFavorite);
    }

    @PutMapping(path = "/favorite/{recipeId}")
    public ResponseEntity<String> addFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addRecipeToFavorites(uid, recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @DeleteMapping( path = "/favorite/{recipeId}")
    public ResponseEntity<String> removeFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeRecipeFromFavorites(uid, recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @GetMapping(path = "/favorite/all")
    public ResponseEntity<List<Recipe>> getFavorites(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<Recipe> recipes = userService.getFavoriteRecipes(uid);
        return new ResponseEntity<>(recipes, null, HttpStatus.OK);
    }

    @GetMapping(path = "/pantry")
    public ResponseEntity<List<PantryItem>> getUserPantry(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<PantryItem> pantryItems = userService.getUserPantryItems(uid);
        return ResponseEntity.ok(pantryItems);
    }

    @PostMapping(path = "/pantry")
    public ResponseEntity<Void> addIngredientToPantry(
            HttpServletRequest request,
            @RequestParam String ingredientId,
            @RequestParam Integer quantity) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addIngredientToPantry(uid, ingredientId, quantity);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping(path = "/pantry/{ingredientId}")
    public ResponseEntity<PantryItem> updateIngredientQuantity(
            HttpServletRequest request,
            @PathVariable String ingredientId,
            @RequestParam Integer quantity) {
        String uid = (String) request.getSession().getAttribute("uid");
        PantryItem updatedItem = userService.updateIngredientQuantity(uid, ingredientId, quantity);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping(path = "/pantry/{ingredientId}")
    public ResponseEntity<Void> removeIngredientFromPantry(
            HttpServletRequest request,
            @PathVariable String ingredientId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeIngredientFromPantry(uid, ingredientId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "/preferences")
    public ResponseEntity<User> addUserPreferences(
            HttpServletRequest request,
            @RequestBody Preferences preferences) {
        String uid = (String) request.getSession().getAttribute("uid");
        User user = userRepository.findUserByFirebaseId(uid).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        user.setPreferences(preferences);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping(path = "/preferences")
    public ResponseEntity<Preferences> getUserPreferences(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        User user = userRepository.findUserByFirebaseId(uid).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return ResponseEntity.ok(user.getPreferences());
    }

    @GetMapping(path = "/recipeHistory/all")
    public ResponseEntity<List<RecipeHistory>> getUserRecipeHistory(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<RecipeHistory> recipeHistoryList = userService.getRecipeHistory(uid);
        return new ResponseEntity<>(recipeHistoryList, HttpStatus.OK);
    }

    @PostMapping(path = "/recipeHistory/{recipeId}")
    public ResponseEntity<String> addUserRecipeHistory(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addItemToRecipeHistory(uid, recipeId);
        return new ResponseEntity<>(null,null ,HttpStatus.OK);
    }
    
    @DeleteMapping(path = "/recipeHistory/{recipeId}")
    public ResponseEntity<Void> removeItemFromRecipeHistory(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeItemFromRecipeHistory(uid, recipeId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "/recipeHistory/update")
    public ResponseEntity<List<String>> updatePantryAfterRecipe(
            HttpServletRequest request,
            @RequestParam List<String> ingredientIds) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.updatePantryAfterRecipe(uid, ingredientIds);
        return ResponseEntity.ok(ingredientIds);
    }

    @GetMapping(path = "/recipeHistory/last")
    public ResponseEntity<RecipeHistory> getLastRecipeHistory(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        RecipeHistory lastRecipe = userService.getLastRecipeHistory(uid);
        return new ResponseEntity<>(lastRecipe, HttpStatus.OK);
    }
}
