 package com.example.forksup.service.prompt;

import com.example.forksup.model.Recipe;
import java.util.List;

public class RecipePromptBuilder {
    private final Recipe recipe;
    private final String question;
    private boolean useIngredients;
    private boolean useSteps;

    public RecipePromptBuilder(Recipe recipe, String question) {
        this.recipe = recipe;
        this.question = question;
    }

    public RecipePromptBuilder withIngredients() {
        if (useSteps) {
            throw new IllegalStateException("Cannot analyze both ingredients and steps. Choose one.");
        }
        this.useIngredients = true;
        return this;
    }

    public RecipePromptBuilder withSteps() {
        if (useIngredients) {
            throw new IllegalStateException("Cannot analyze both ingredients and steps. Choose one.");
        }
        this.useSteps = true;
        return this;
    }

    public String build() {
        if (!useIngredients && !useSteps) {
            throw new IllegalStateException("Must choose either ingredients or steps for analysis.");
        }

        StringBuilder promptBuilder = new StringBuilder();
        
        if (useIngredients) {
            List<String> ingredients = recipe.getIngredientsRawStr();
            if (ingredients == null || ingredients.isEmpty()) {
                throw new IllegalArgumentException("Recipe has no ingredients");
            }
            promptBuilder.append("Ingredients: ")
                       .append(String.join(", ", ingredients))
                       .append("\n\n");
        }
        
        if (useSteps) {
            List<String> steps = recipe.getSteps();
            if (steps == null || steps.isEmpty()) {
                throw new IllegalArgumentException("Recipe has no steps");
            }
            promptBuilder.append("Steps:\n")
                       .append(String.join("\n", steps))
                       .append("\n\n");
        }
        
        promptBuilder.append("Based on the provided information, ")
                    .append(question);
        
        return promptBuilder.toString();
    }
}
