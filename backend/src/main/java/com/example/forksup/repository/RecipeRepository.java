package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId> {

    @Query("{ $text: { $search: ?0 } }")
    List<Recipe> findByNameTextSearch(String keyword, Pageable pageable);

    @Cacheable(value = "recipeCountCache", key = "#keyword")
    @Query(value = "{ $text: { $search: '?0' }}", count = true)
    long countByNameTextSearch(String keyword);

}