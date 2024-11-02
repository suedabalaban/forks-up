package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId>, CustomRecipeRepository {
    @Query(value = "{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Recipe> searchByNameContaining(String keyword, Pageable pageable);
}
