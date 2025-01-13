package com.example.forksup.repository.recipe;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecipeRepositoryCustom {
    Page<Recipe> searchRecipes(
            String name,
            List<String> tags,
            List<Ingredient> ingredients,
            Integer servings,
            Pageable pageable);

    Page<Recipe> searchRecipesWithPreferences(
            String name,
            List<String> cuisineTags,
            List<String> otherTags,
            List<Ingredient> ingredients,
            Integer servings,
            Pageable pageable);
}
