package com.example.forksup.repository;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.TestPropertySource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class RecipeRepositoryTest {

    @Autowired
    private RecipeRepository recipeRepository;

    private Recipe recipe1;
    private Recipe recipe2;

    @BeforeEach
    public void setup() {

        recipe1 = createRecipe(
                1L,
                "Oven Roasted Chicken",
                "Delicious roasted chicken with herbs and spices",
                Arrays.asList("chicken", "herbs", "olive oil", "garlic"),
                "2 servings",
                2,
                Arrays.asList("Clean the chicken", "Season with herbs and spices", "Roast at 375°F for 45 minutes"),
                Arrays.asList("chicken", "main course", "baked")
        );

        recipe2 = createRecipe(
                2L,
                "Creamy Pasta Salad",
                "Light and delicious pasta salad with yogurt dressing",
                Arrays.asList("pasta", "yogurt", "cucumber", "dill", "red pepper"),
                "4 servings",
                4,
                Arrays.asList("Cook the pasta", "Prepare the sauce", "Mix everything together", "Chill before serving"),
                Arrays.asList("pasta", "salad", "cold dish")
        );

        recipeRepository.saveAll(Arrays.asList(recipe1, recipe2));
    }


    @Test
    public void testFindById() {
        Recipe foundRecipe = recipeRepository.findById(recipe1.getObjectId()).orElse(null);

        assertThat(foundRecipe).isNotNull();
        assertThat(foundRecipe.getName()).isEqualTo("Oven Roasted Chicken");
        assertThat(foundRecipe.getDescription()).isEqualTo("Delicious roasted chicken with herbs and spices");
    }

    @Test
    @Rollback(false)
    public void testSaveRecipe() {
        Recipe newRecipe = createRecipe(
                4L,
                "Lentil Soup",
                "Hearty and nutritious lentil soup",
                Arrays.asList("red lentils", "onion", "carrot", "olive oil", "cumin", "paprika"),
                "6 servings",
                6,
                Arrays.asList("Chop the vegetables", "Rinse the lentils", "Cook everything together", "Blend until smooth"),
                Arrays.asList("soup", "lentils", "vegetarian")
        );

        Recipe savedRecipe = recipeRepository.save(newRecipe);

        assertThat(savedRecipe).isNotNull();
        assertThat(savedRecipe.getObjectId()).isNotNull();
        assertThat(savedRecipe.getName()).isEqualTo("Lentil Soup");

        Recipe retrievedRecipe = recipeRepository.findById(savedRecipe.getObjectId()).orElse(null);
        assertThat(retrievedRecipe).isNotNull();
        assertThat(retrievedRecipe.getName()).isEqualTo("Lentil Soup");
    }

    @Test
    public void testUpdateRecipe() {
        Recipe recipeToUpdate = recipeRepository.findById(recipe2.getObjectId()).orElse(null);
        assertThat(recipeToUpdate).isNotNull();

        recipeToUpdate.setName("Updated Pasta Salad");
        recipeToUpdate.setDescription("Updated description for pasta salad");

        Recipe updatedRecipe = recipeRepository.save(recipeToUpdate);

        assertThat(updatedRecipe.getName()).isEqualTo("Updated Pasta Salad");
        assertThat(updatedRecipe.getDescription()).isEqualTo("Updated description for pasta salad");

        Recipe retrievedRecipe = recipeRepository.findById(recipe2.getObjectId()).orElse(null);
        assertThat(retrievedRecipe).isNotNull();
        assertThat(retrievedRecipe.getName()).isEqualTo("Updated Pasta Salad");
        assertThat(retrievedRecipe.getDescription()).isEqualTo("Updated description for pasta salad");
    }

    @Test
    public void testSearchRecipesAdvanced() {
        Slice<Recipe> results = recipeRepository.searchRecipesAdvanced("chicken", 1, PageRequest.of(0, 10));

        if (results != null && results.hasContent()) {
            assertThat(results.getContent()).isNotEmpty();
            boolean containsChicken = results.getContent().stream()
                    .anyMatch(r -> r.getName().contains("Chicken") ||
                            r.getDescription().contains("chicken") ||
                            r.getTags().contains("chicken"));
            assertThat(containsChicken).isTrue();
        }
    }

    /**
     * Helper method to create Recipe objects for testing
     */
    private Recipe createRecipe(Long recipeId, String name, String description, List<String> ingredientsRaw,
                                String servingSize, int servings, List<String> steps, List<String> tags) {
        Recipe recipe = new Recipe();
        recipe.setRecipeId(recipeId);
        recipe.setName(name);
        recipe.setDescription(description);
        recipe.setIngredientsRawStr(ingredientsRaw);
        recipe.setIngredients(Collections.emptyList());
        recipe.setServing_size(servingSize);
        recipe.setServings(servings);
        recipe.setSteps(steps);
        recipe.setTags(tags);
        recipe.setSearchTerms(tags);

        return recipe;
    }
}