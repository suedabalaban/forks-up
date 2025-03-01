package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.Recipe;
import com.example.forksup.model.Review;
import com.example.forksup.model.User;
import com.example.forksup.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final UserService userService;

    private final RecipeService recipeService;

    ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
        this.userService = new UserService();
        this.recipeService = new RecipeService();
    }

    public Review addUserReview(String firebaseId, String recipeId, String comment, int rating, MultipartFile image) {
        User user = userService.getUserByFirebaseID(firebaseId);
        Recipe recipe = recipeService.getByRecipeId(recipeId);

        Review review;
        try {
            review = new Review(user, recipe, comment, rating, image.getBytes());
            return reviewRepository.save(review);
        } catch (IOException e) {
            throw new RuntimeException("Error processing the upload file", e);
        }
    }

    public List<Review> getReviewsByRecipeId(String recipeId) {
        Recipe recipe = recipeService.getByRecipeId(recipeId);
        return reviewRepository.findByRecipe_Id(new ObjectId(recipe.getId())).orElseThrow(
                () -> new ResourceNotFoundException("Reviews not found")
        );
    }

}
