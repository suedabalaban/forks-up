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

    /**
     * Retrieves a user by their unique identifier.
     * This endpoint performs a lookup in the user database and handles potential null cases.
     *
     * @param id The unique identifier of the user
     * @return ResponseEntity containing either:
     *         - User object with HTTP 200 (OK) if found
     *         - null with HTTP 404 (NOT_FOUND) if user doesn't exist
     */
    @GetMapping(path = "/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        User u =  userService.getUserById(id);
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(u, null, HttpStatus.OK);
    }

    /**
     * Creates a new user record using the Firebase UID from the session.
     * This endpoint initializes a basic user profile with minimal information,
     * leaving optional fields as null for later updates.
     *
     * @param request HTTP request containing the session with Firebase UID
     * @return ResponseEntity with:
     *         - HTTP 200 (OK) if user creation successful
     *         - HTTP 400 (BAD_REQUEST) if creation fails
     */
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

    /**
     * Checks if a specific recipe is in the user's favorites list.
     * This is a utility endpoint that helps frontend determine if a recipe
     * should be displayed as favorited or not.
     *
     * @param request HTTP request containing user session
     * @param recipeId The unique identifier of the recipe to check
     * @return ResponseEntity with boolean indicating if recipe is favorited
     */
    @GetMapping("/favorite/{recipeId}")
    public ResponseEntity<Boolean> isRecipeInFavorites(HttpServletRequest request, @PathVariable String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        boolean isFavorite = userService.isRecipeInFavorites(uid, recipeId);
        return ResponseEntity.ok(isFavorite);
    }

    /**
     * Adds a recipe to the user's favorites collection.
     * This endpoint manages the many-to-many relationship between users and their
     * favorite recipes.
     *
     * @param request HTTP request containing user session
     * @param recipeId The unique identifier of the recipe to favorite
     * @return ResponseEntity with HTTP 200 (OK) on successful addition
     */
    @PutMapping(path = "/favorite/{recipeId}")
    public ResponseEntity<String> addFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addRecipeToFavorites(uid, recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    /**
     * Removes a recipe from the user's favorites collection.
     * This endpoint handles the deletion of a favorite recipe association
     * without affecting the actual recipe or user records.
     *
     * @param request HTTP request containing user session
     * @param recipeId The unique identifier of the recipe to remove
     * @return ResponseEntity with HTTP 200 (OK) on successful removal
     */
    @DeleteMapping(path = "/favorite/{recipeId}")
    public ResponseEntity<String> removeFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeRecipeFromFavorites(uid, recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    /**
     * Retrieves all recipes that the user has marked as favorites.
     * This endpoint performs a join operation between user favorites and recipe data
     * to return complete recipe information for each favorite.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with List of Recipe objects and HTTP 200 (OK)
     */
    @GetMapping(path = "/favorite/all")
    public ResponseEntity<List<Recipe>> getFavorites(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<Recipe> recipes = userService.getFavoriteRecipes(uid);
        return new ResponseEntity<>(recipes, null, HttpStatus.OK);
    }

    /**
     * Retrieves the user's virtual pantry containing all stored ingredients.
     * The pantry is a persistent storage of ingredients that the user has available
     * for cooking, including their quantities.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with List of PantryItem objects
     */
    @GetMapping(path = "/pantry")
    public ResponseEntity<List<PantryItem>> getUserPantry(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<PantryItem> pantryItems = userService.getUserPantryItems(uid);
        return ResponseEntity.ok(pantryItems);
    }

    /**
     * Adds a new ingredient to the user's pantry with specified quantity.
     * This endpoint creates a new pantry entry if the ingredient doesn't exist,
     * managing the relationship between users and their available ingredients.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient
     * @param quantity Amount of the ingredient to add
     * @return ResponseEntity with HTTP 201 (CREATED) on successful addition
     */
    @PostMapping(path = "/pantry")
    public ResponseEntity<Void> addIngredientToPantry(
            HttpServletRequest request,
            @RequestParam String ingredientId,
            @RequestParam Integer quantity,
            @RequestParam String unit
    ) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addIngredientToPantry(uid, ingredientId, quantity, unit);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * Updates the quantity of an existing ingredient in the user's pantry.
     * This endpoint modifies the amount of an ingredient without changing other
     * properties or relationships.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient
     * @param quantity New quantity to set
     * @return ResponseEntity with updated PantryItem
     */
    @PutMapping(path = "/pantry/{ingredientId}")
    public ResponseEntity<PantryItem> updateIngredientQuantity(
            HttpServletRequest request,
            @PathVariable String ingredientId,
            @RequestParam Integer quantity,
            @RequestParam String unit) {
        String uid = (String) request.getSession().getAttribute("uid");
        PantryItem updatedItem = userService.updateIngredientQuantity(uid, ingredientId, quantity, unit);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Removes an ingredient entirely from the user's pantry.
     * This endpoint deletes the association between user and ingredient in the pantry,
     * typically used when an ingredient is depleted or no longer needed.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient to remove
     * @return ResponseEntity with HTTP 204 (NO_CONTENT) on successful removal
     */
    @DeleteMapping(path = "/pantry/{ingredientId}")
    public ResponseEntity<Void> removeIngredientFromPantry(
            HttpServletRequest request,
            @PathVariable String ingredientId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeIngredientFromPantry(uid, ingredientId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Stores or updates a user's cooking preferences and dietary restrictions.
     * This endpoint manages user-specific settings that affect recipe recommendations
     * and filtering options.
     *
     * @param request HTTP request containing user session
     * @param preferences Object containing user preference settings
     * @return ResponseEntity with updated User object
     * @throws ResourceNotFoundException if user not found
     */
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

    /**
     * Retrieves the user's current preference settings.
     * This endpoint provides access to stored dietary restrictions, cooking preferences,
     * and other user-specific settings.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with Preferences object
     * @throws ResourceNotFoundException if user not found
     */
    @GetMapping(path = "/preferences")
    public ResponseEntity<Preferences> getUserPreferences(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        User user = userRepository.findUserByFirebaseId(uid).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return ResponseEntity.ok(user.getPreferences());
    }

    /**
     * Retrieves the complete cooking history of the user.
     * This endpoint returns a chronological list of all recipes the user has marked
     * as cooked, helping track cooking patterns and favorites.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with List of RecipeHistory objects
     */
    @GetMapping(path = "/recipeHistory/all")
    public ResponseEntity<List<RecipeHistory>> getUserRecipeHistory(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<RecipeHistory> recipeHistoryList = userService.getRecipeHistory(uid);
        return new ResponseEntity<>(recipeHistoryList, HttpStatus.OK);
    }

    /**
     * Adds a recipe to the user's cooking history.
     * This endpoint records when a user has cooked a specific recipe,
     * maintaining a chronological log of cooking activities.
     *
     * @param request HTTP request containing user session
     * @param recipeId Unique identifier of the cooked recipe
     * @return ResponseEntity with HTTP 200 (OK) on successful addition
     */
    @PostMapping(path = "/recipeHistory/{recipeId}")
    public ResponseEntity<String> addUserRecipeHistory(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.addItemToRecipeHistory(uid, recipeId);
        return new ResponseEntity<>(null,null ,HttpStatus.OK);
    }

    /**
     * Removes a recipe from the user's cooking history.
     * This endpoint allows deletion of historical cooking records,
     * useful for correcting mistakes or removing unwanted entries.
     *
     * @param request HTTP request containing user session
     * @param recipeId Unique identifier of the recipe to remove
     * @return ResponseEntity with HTTP 204 (NO_CONTENT) on successful removal
     */
    @DeleteMapping(path = "/recipeHistory/{recipeId}")
    public ResponseEntity<Void> removeItemFromRecipeHistory(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeItemFromRecipeHistory(uid, recipeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates the pantry quantities after a recipe has been cooked.
     * This endpoint automatically adjusts ingredient quantities in the user's pantry
     * based on the ingredients used in the cooked recipe.
     *
     * @param request HTTP request containing user session
     * @param ingredientIds List of ingredients used in the recipe
     * @return ResponseEntity with list of updated ingredient IDs
     */
    @PutMapping(path = "/recipeHistory/update")
    public ResponseEntity<List<String>> updatePantryAfterRecipe(
            HttpServletRequest request,
            @RequestParam List<String> ingredientIds) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.updatePantryAfterRecipe(uid, ingredientIds);
        return ResponseEntity.ok(ingredientIds);
    }

    /**
     * Retrieves the most recent recipe from the user's cooking history.
     * This endpoint provides quick access to the last cooked recipe,
     * useful for features like "Cook Again" or recent activity displays.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with most recent RecipeHistory object
     */
    @GetMapping(path = "/recipeHistory/last")
    public ResponseEntity<RecipeHistory> getLastRecipeHistory(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        RecipeHistory lastRecipe = userService.getLastRecipeHistory(uid);
        return new ResponseEntity<>(lastRecipe, HttpStatus.OK);
    }

}
