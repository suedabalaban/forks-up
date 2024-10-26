package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId>, CustomRecipeRepository {
    List<Recipe> findByName(String name);

    List<Recipe> findByDescriptionContaining(String description);
}
