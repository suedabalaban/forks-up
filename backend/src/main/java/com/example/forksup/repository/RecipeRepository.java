package com.example.forksup.repository;

import com.example.forksup.model.Recipe;

import org.bson.types.ObjectId;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, ObjectId> {

    @Query("{ $text: { $search: ?0 } }")
    List<Recipe> findByNameTextSearch(String keyword, Pageable pageable);

    @Query(" {ingredients: {$in: ?0}}")
    List<Recipe> findByIngredientsIn(List<ObjectId> ingredientIds, Pageable pageable);

    @Query(" {tags: { $all: ?0} }")
    List<Recipe> findByTagsIn(List<String> tags, Pageable pageable);

    @Query("{ $and: [ { $text: { $search: ?0 } }, { tags: { $all: ?1 } } ] }")
    List<Recipe> findByNameAndTags(String keyword, List<String> tags, Pageable pageable);

    @Query("{ $and: [ " +
            "  { $text: { $search: ?0 } }, " +
            "  { tags: { $all: ?1 } }, " +
            "  { ingredients: { $in: ?2 } } " +
            "] }")
    List<Recipe> findByNameTagsAndIngredients(String keyword, List<String> tags, List<ObjectId> ingredientIds, Pageable pageable);

    @Cacheable(value = "recipeCountCache", key = "#keyword")
    @Query(value = "{ $text: { $search: '?0' }}", count = true)
    long countByNameTextSearch(String keyword);

    @Cacheable(value = "recipeCountCache", key = "#keyword + #tags")
    @Query(value = "{ $and: [ { $text: { $search: ?0 } }, { tags: { $all: ?1 } } ] }", count = true)
    long countByNameAndTags(String keyword, List<String> tags);

    @Query(value = "{ $and: [ " +
            "  { $text: { $search: ?0 } }, " +
            "  { tags: { $all: ?1 } }, " +
            "  { ingredients: { $in: ?2 } } " +
            "] }", count = true)
    long countByNameTagsAndIngredients(String keyword, List<String> tags, List<ObjectId> ingredientIds);

    @Query(value = " {ingredients: {$in: ?0}}", count = true)
    long countByIngredients(List<ObjectId> ingredientIds);

    @Query(value = "{tags: {$all: ?0}}", count = true)
    long countByTags(List<String> tags);

    @Cacheable(value = "uniqueTagsCache")
    @Aggregation(pipeline = {
            "{ $unwind: '$tags' }",
            "{ $group: { _id: '$tags' } }",
            "{ $sort: { _id: 1 } }"
    })
    List<String> findDistinctTags();
}