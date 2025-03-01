package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.model.Review;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.RecipeService;

import com.example.forksup.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private ReviewService reviewService;

    /**
     * Retrieves a specific recipe from the database using its MongoDB ObjectId.
     * This endpoint performs several validation steps:
     * 1. Validates the ID format (must be 24 characters long)
     * 2. Attempts to convert the string ID to a MongoDB ObjectId
     * 3. Searches the database for a matching recipe
     * Error Handling:
     * - Returns BAD_REQUEST (400) if:
     *   * ID is null
     *   * ID length is not 24 characters
     *   * ID cannot be converted to valid MongoDB ObjectId
     * - Returns NOT_FOUND (404) if recipe doesn't exist
     *
     * @param id The 24-character MongoDB ObjectId of the recipe
     * @return ResponseEntity containing:
     *         - Recipe object with HTTP 200 (OK) if found
     *         - null with HTTP 400 (BAD_REQUEST) for invalid ID
     *         - null with HTTP 404 (NOT_FOUND) if recipe doesn't exist
     */
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

    /**
     * Performs a flexible search across the recipe database using multiple criteria.
     * This endpoint supports complex queries combining:
     * - Keyword search (searches recipe names and descriptions)
     * - Tag filtering (cuisine types, dietary restrictions, etc.)
     * - Ingredient-based filtering
     * The search is implemented using regex pattern matching for flexible text search.
     * Results are paginated to optimize performance and data transfer.
     *
     * @param request The HTTP request object containing session information
     * @param keyword Optional search term for recipe names/descriptions
     * @param tags Optional list of tags for filtering (e.g., "Italian", "Vegetarian")
     * @param ingredients Optional list of ingredients to search for
     * @param page Page number for pagination (0-based indexing)
     * @param size Number of recipes per page
     * @return ResponseEntity with:
     *         - Page<Recipe> containing matching recipes and pagination metadata
     *         - Default page size is 9 recipes
     */
    @GetMapping("/search")
    public ResponseEntity<Slice<Recipe>> searchRecipesRegex(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        String uid = (String) request.getSession().getAttribute("uid");
        Slice<Recipe> recipes = recipeService.searchRecipes(keyword, tags, ingredients, page, size);
        return ResponseEntity.ok(recipes);
    }

    /**
     * Searches recipes based on user preferences and pantry contents.
     * This endpoint provides personalized recipe recommendations by:
     * 1. Considering user's dietary preferences (stored in their profile)
     * 2. Matching against ingredients available in their pantry
     * 3. Applying any additional search criteria (keyword, tags)
     *
     * Authentication is required - unauthorized requests return 401.
     * Results are paginated and can be filtered further using provided parameters.
     *
     * @param request The HTTP request object containing user session
     * @param keyword Optional search term for recipe names/descriptions
     * @param tags Optional additional tags for filtering beyond preferences
     * @param ingredients Optional specific ingredients to include
     * @param page Page number for pagination (0-based indexing)
     * @param size Number of recipes per page
     * @return ResponseEntity with:
     *         - Page<Recipe> containing personalized recipe matches
     *         - HTTP 401 (UNAUTHORIZED) if user not logged in
     *         - Default page size is 9 recipes
     */
    @GetMapping("/preferences")
    public ResponseEntity<Slice<Recipe>> searchRecipesByPreferences(
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
        Slice<Recipe> recipes = recipeService.searchRecipesByPreferences(uid, keyword, tags, ingredients, page, size);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping(path = "/{recipeId}/review", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> addReview(
            HttpServletRequest request,
            @PathVariable("recipeId") String recipeId,
            @RequestPart("review") String review,
            @RequestPart("rating") String rating,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        String uid = (String) request.getSession().getAttribute("uid");

        int ratingValue = Integer.parseInt(rating);
        if (ratingValue < 0 || ratingValue > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 0 and 5");
        }

        return ResponseEntity.ok(reviewService.addUserReview(uid, recipeId, review, ratingValue, image));
    }

    @GetMapping("/{recipeId}/review")
    public ResponseEntity<List<Review>> getReviewsByRecipe(
            @PathVariable("recipeId") String recipeId
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByRecipeId(recipeId));
    }

}