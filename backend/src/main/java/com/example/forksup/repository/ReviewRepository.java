package com.example.forksup.repository;

import com.example.forksup.model.Review;
import com.example.forksup.model.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, ObjectId> {
    Optional<List<Review>> findByRecipe_Id(ObjectId recipeId);

    List<Review> getReviewsByUser(User user);

    void deleteReviewByUserAndId(User user, ObjectId id);

    List<Review> findByIsProcessedFalse();
}