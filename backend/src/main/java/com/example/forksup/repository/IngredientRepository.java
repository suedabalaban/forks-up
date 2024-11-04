package com.example.forksup.repository;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface IngredientRepository extends MongoRepository<Ingredient, ObjectId> {
    @Query(value = "{ $text: { $search: ?0 } }", sort = "{ score: { $meta: 'textScore' } }")
    List<Ingredient> findByKeywordSortedByRelevance(String keyword);
}