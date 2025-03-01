package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.Recipe;
import com.example.forksup.model.Review;
import com.example.forksup.model.User;
import com.example.forksup.repository.ReviewRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final RecipeService recipeService;

    ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, RecipeService recipeService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.recipeService = recipeService;
    }

    public Review addUserReview(String firebaseId, String recipeId, String comment, int rating, MultipartFile image) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );        Recipe recipe = recipeService.getByRecipeId(recipeId);

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

    public List<Review> getReviewsByUser(String firebaseId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return reviewRepository.getReviewsByUser(user);
    }

    public void deleteReviewForUser(String firebaseId, String reviewId) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        reviewRepository.deleteReviewByUserAndId(user, new ObjectId(reviewId));
    }

}
