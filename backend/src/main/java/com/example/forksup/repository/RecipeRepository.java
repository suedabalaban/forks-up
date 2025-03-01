package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId> {

    @Aggregation(pipeline = {
            "{$match: { $text: { $search: ?0 } } }",
            "{ $addFields: { totalScore: { $add: [{ $meta: \"textScore\" }] } } }",
            "{ $sort: { totalScore: -1 } }"
    })
    Slice<Recipe> searchRecipesAdvanced(String text, Pageable pageable);

}