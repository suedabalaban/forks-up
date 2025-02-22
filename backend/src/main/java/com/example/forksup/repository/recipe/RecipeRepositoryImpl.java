package com.example.forksup.repository.recipe;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class RecipeRepositoryImpl implements RecipeRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Page<Recipe> searchRecipes(
            String name,
            List<String> tags,
            List<Ingredient> ingredients,
            Integer servings,
            Pageable pageable
    ) {
        Query query = new Query();

        if (name != null && !name.isEmpty()) {
            query.addCriteria(TextCriteria.forDefaultLanguage().matchingPhrase(name)); // Case-insensitive
        }
        if (tags != null && !tags.isEmpty()) {
            query.addCriteria(Criteria.where("tags").all(tags));
        }
        if (ingredients != null && !ingredients.isEmpty()) {
            query.addCriteria(Criteria.where("ingredients").in(ingredients));
        }
        if (servings != null) {
            query.addCriteria(Criteria.where("servings").is(servings));
        }

        long total = mongoTemplate.count(query, Recipe.class);
        query.skip((long) pageable.getPageNumber() * pageable.getPageSize());
        query.limit(pageable.getPageSize());

        List<Recipe> recipes = mongoTemplate.find(query, Recipe.class);

        return new PageImpl<>(recipes, pageable, total);
    }

    @Override
    public Page<Recipe> searchRecipesWithPreferences(
            String name,
            List<String> cuisineTags,
            List<String> otherTags,
            List<Ingredient> ingredients,
            Integer servings,
            Pageable pageable
    ) {
        Query query = new Query();

        if (name != null && !name.isEmpty()) {
            query.addCriteria(TextCriteria.forDefaultLanguage().matchingPhrase(name));
        }

        // Create separate criteria for cuisine tags and other tags
        Criteria tagsCriteria = new Criteria();
        if (cuisineTags != null && !cuisineTags.isEmpty()) {
            tagsCriteria.orOperator(
                    Criteria.where("tags").in(cuisineTags)
            );
        }
        if (otherTags != null && !otherTags.isEmpty()) {
            query.addCriteria(Criteria.where("tags").all(otherTags));
        }
        if (!tagsCriteria.getCriteriaObject().isEmpty()) {
            query.addCriteria(tagsCriteria);
        }
        if (ingredients != null && !ingredients.isEmpty()) {
            query.addCriteria(Criteria.where("ingredients").in(ingredients));
        }
        if (servings != null) {
            query.addCriteria(Criteria.where("servings").is(servings));
        }

        long total = mongoTemplate.count(query, Recipe.class);
        query.skip((long) pageable.getPageNumber() * pageable.getPageSize());
        query.limit(pageable.getPageSize());

        List<Recipe> recipes = mongoTemplate.find(query, Recipe.class);
        return new PageImpl<>(recipes, pageable, total);
    }

    @Override
    public Page<Recipe> searchRecipesWithIngredientsMatch(
            String name,
            List<String> cuisineTags,
            List<String> otherTags,
            List<Ingredient> userIngredients,
            Integer servings,
            Pageable pageable
    ) {
        // Build the base query for non-ingredient criteria
        Query query = new Query();

        if (name != null && !name.isEmpty()) {
            query.addCriteria(TextCriteria.forDefaultLanguage().matchingPhrase(name));
        }

        // Combine tag criteria
        List<Criteria> tagsCriteria = new ArrayList<>();
        if (otherTags != null && !otherTags.isEmpty()) {
            tagsCriteria.add(Criteria.where("tags").all(otherTags));
        }
        if (cuisineTags != null && !cuisineTags.isEmpty()) {
            tagsCriteria.add(Criteria.where("tags").in(cuisineTags));
        }
        if (!tagsCriteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(tagsCriteria.toArray(new Criteria[0])));
        }

        if (servings != null) {
            query.addCriteria(Criteria.where("servings").is(servings));
        }

        // First get all matching recipes without ingredient filtering
        List<Recipe> allRecipes = mongoTemplate.find(query, Recipe.class);
        
        // Then filter by ingredients if user has ingredients
        List<Recipe> filteredRecipes = allRecipes;
        if (userIngredients != null && !userIngredients.isEmpty()) {
            // Create a set of ingredient IDs for faster lookup
            Set<String> userIngredientIds = userIngredients.stream()
                    .map(Ingredient::getId)
                    .collect(Collectors.toSet());

            // Filter recipes based on ingredient match percentage
            filteredRecipes = allRecipes.stream()
                    .filter(recipe -> {
                        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
                            return false;
                        }

                        // Count matching ingredients
                        long matchingCount = recipe.getIngredients().stream()
                                .map(Ingredient::getId)
                                .filter(userIngredientIds::contains)
                                .count();

                        // Calculate match percentage
                        double matchPercentage = ((double) matchingCount / recipe.getIngredients().size()) * 100;
                        return matchPercentage >= 30.0; // Lowered threshold to 30%
                    })
                    .collect(Collectors.toList());
        }

        // Handle pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredRecipes.size());
        
        List<Recipe> pageContent = start >= filteredRecipes.size() ? 
            new ArrayList<>() : 
            filteredRecipes.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filteredRecipes.size());
    }

}
