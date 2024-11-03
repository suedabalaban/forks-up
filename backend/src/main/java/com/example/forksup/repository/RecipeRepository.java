package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId> {

    @Query(value = "{$text: {$search: ?0}}")
    List<Recipe> findFirstPage(String keyword, Pageable pageable);

    @Query(value = "{$and: [{$text: {$search: ?0}}, {_id: {$gt: ?1}}]}")
    List<Recipe> findNextPage(String keyword, ObjectId lastId, Pageable pageable);

}
