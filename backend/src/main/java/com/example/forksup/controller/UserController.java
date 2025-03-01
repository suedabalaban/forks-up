package com.example.forksup.controller;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.*;
import com.example.forksup.repository.UserRepository;
import com.example.forksup.service.ReviewService;
import com.example.forksup.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReviewService reviewService;

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
                null,
                null,
                null)
        );
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @GetMapping("")
    public ResponseEntity<User> getMyUser(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        User u  = userService.getUserByFirebaseID(uid);
        return ResponseEntity.ok(u);
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
        return ResponseEntity.ok(userService.addUserPreferences(uid, preferences));
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
    @GetMapping(path = "/history/all")
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
    @PostMapping(path = "/history/{recipeId}")
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
    @DeleteMapping(path = "/history/{recipeId}")
    public ResponseEntity<Void> removeItemFromRecipeHistory(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.removeItemFromRecipeHistory(uid, recipeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the most recent recipe from the user's cooking history.
     * This endpoint provides quick access to the last cooked recipe,
     * useful for features like "Cook Again" or recent activity displays.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with most recent RecipeHistory object
     */
    @GetMapping(path = "/history/last")
    public ResponseEntity<RecipeHistory> getLastRecipeHistory(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        RecipeHistory lastRecipe = userService.getLastRecipeHistory(uid);
        return new ResponseEntity<>(lastRecipe, HttpStatus.OK);
    }

    /**
     * Uploads a user's avatar image and stores it in the user's profile.
     * This endpoint allows the user to upload an image file (e.g., .jpg, .png)
     * as their avatar, which is then saved in the user's profile in the database.
     *
     * @param request HTTP request containing user session information, used to retrieve the user's ID.
     * @param avatar The avatar image file to be uploaded, received as a MultipartFile.
     * @return ResponseEntity with a success message if the avatar is uploaded successfully.
     * @throws RuntimeException if there is an error while processing the file (e.g., file read error).
     * @throws IllegalArgumentException if the uploaded file is empty or invalid.
     */
    @PostMapping(path = "/avatar")
    public ResponseEntity<String> uploadAvatar(
            HttpServletRequest request,
            @RequestParam MultipartFile avatar
    ) {
        String uid = (String) request.getSession().getAttribute("uid");
        userService.uploadAvatar(uid, avatar);
        return ResponseEntity.ok("Avatar uploaded successfully.");
    }

    /**
     * Retrieves the avatar image of the currently logged-in user.
     * This endpoint fetches the avatar image stored in the user's profile
     * and returns it as a byte array. The image can be used in frontend applications
     * to display the user's profile picture.
     *
     * @param request HTTP request containing user session information, used to retrieve the user's ID.
     * @return ResponseEntity containing the avatar image as a byte array with an HTTP status of 200 (OK).
     *         If the user does not have an avatar, the response body will be empty.
     * @throws ResourceNotFoundException if the user is not found in the database.
     */
    @GetMapping(path = "/avatar", produces = "image/jpeg")
    public ResponseEntity<byte[]> getAvatar(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        return ResponseEntity.ok( userService.getAvatar(uid));
    }

    /**
     * Generates the user's avatar.
     *
     * This method uses the UID obtained from the session to create an avatar
     * by making a request to the external API. The image data returned from
     * the API is saved in the user's avatar field.
     *
     * @param request HTTP request object, used to obtain the UID from the session.
     * @return ResponseEntity<User> The updated user object along with the HTTP response.
     * @throws ResourceNotFoundException If the user cannot be found.
     * @throws RuntimeException If an error occurs during the API request.
     */
    @PostMapping(path = "/generate-avatar", produces = "image/jpeg")
    public ResponseEntity<byte[]> generateAvatar(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        User updatedUser = userService.generateAvatar(uid);
        return ResponseEntity.ok(updatedUser.getAvatar());
    }

    /**
     * Updates the description of the currently logged-in user.
     * This endpoint allows the user to update their profile description,
     * which will be stored in the user's profile in the database.
     * The description should not exceed 200 characters.
     *
     * @param request     HTTP request containing the user session, used to retrieve the user ID.
     * @param requestBody The new description text to be updated in the user's profile.
     * @return ResponseEntity with the updated description and HTTP status OK.
     */
    @PostMapping(path = "/description")
    public ResponseEntity<String> addDescription(
            HttpServletRequest request,
            @RequestBody Map<String, String> requestBody
    ) {
        String uid = (String) request.getSession().getAttribute("uid");
        String description = requestBody.get("description");

        if (description == null) {
            return new ResponseEntity<>("Description is missing", HttpStatus.BAD_REQUEST);
        }

        userService.addDescription(uid, description);
        return new ResponseEntity<>(description, HttpStatus.OK);
    }

    @GetMapping(path = "/review")
    public ResponseEntity<List<Review>> getReviewsByUser(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        return ResponseEntity.ok(reviewService.getReviewsByUser(uid));
    }

    @DeleteMapping(path = "/review/{reviewId}")
    public ResponseEntity<Void> deleteReview(HttpServletRequest request, @PathVariable("reviewId") String reviewId) {
        String uid = (String) request.getSession().getAttribute("uid");
        reviewService.deleteReviewForUser(uid, reviewId);
        return ResponseEntity.noContent().build();
    }

}
