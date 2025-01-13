package com.example.forksup.repository.recipe;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.stereotype.Repository;

import java.util.List;

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
            query.addCriteria(TextCriteria.forDefaultLanguage().matching(name)); // Case-insensitive
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
            query.addCriteria(TextCriteria.forDefaultLanguage().matching(name));
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

}
