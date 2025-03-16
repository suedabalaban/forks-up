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
import java.util.Date;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RecipeService recipeService;
    private final FirebaseUserService firebaseUserService;

    ReviewService(
        ReviewRepository reviewRepository,UserRepository userRepository, 
        RecipeService recipeService, 
        FirebaseUserService firebaseUserService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.recipeService = recipeService;
        this.firebaseUserService = firebaseUserService;
    }

    public Review addUserReview(String firebaseId, String recipeId, String comment, int rating, MultipartFile image,
                                Date timeStamp) {
        User user = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );        Recipe recipe = recipeService.getByRecipeId(recipeId);

        Review review;
        try {
            if (image != null) {
                review = new Review(user, recipe, comment, rating, image.getBytes(), false, timeStamp);
            } else {
                review = new Review(user, recipe, comment, rating, null,true, timeStamp);
            }
            review.setIsProcessed(false);
            return reviewRepository.save(review);
        } catch (IOException e) {
            throw new RuntimeException("Error processing the upload file", e);
        }
    }

    public List<Review> getReviewsByRecipeId(String recipeId) {
        Recipe recipe = recipeService.getByRecipeId(recipeId);
        List<Review> reviews = reviewRepository.findByRecipe_Id(new ObjectId(recipe.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Reviews not found"));

        reviews.forEach(review -> {
            String latestDisplayName = firebaseUserService.getDisplayName(review.getUser().getFirebaseId());
            if (latestDisplayName != null) {
                review.getUser().setDisplayName(latestDisplayName);
            }
        });
        
        return reviews;
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
