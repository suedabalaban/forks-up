package com.example.forksup.service.prompt;

import com.example.forksup.model.Recipe;
import java.util.List;

public class RecipePromptBuilder {
    private final Recipe recipe;
    private final String question;

    public RecipePromptBuilder(Recipe recipe, String question) {
        this.recipe = recipe;
        this.question = question;
    }

    public String build() {
        StringBuilder promptBuilder = new StringBuilder();

        if (recipe.getName() != null && !recipe.getName().isEmpty()) {
            promptBuilder.append("Recipe Name: ")
                    .append(recipe.getName())
                    .append("\t");
        }

        if (recipe.getDescription() != null && !recipe.getDescription().isEmpty()
                && recipe.getDescription().length() < 200) {
            promptBuilder.append("Description: ")
                    .append(recipe.getDescription())
                    .append("\t");
        }

        promptBuilder.append("Servings: ")
                .append(recipe.getServings());
        if (recipe.getServing_size() != null && !recipe.getServing_size().isEmpty()) {
            promptBuilder.append(" (")
                    .append(recipe.getServing_size())
                    .append(")");
        }
        promptBuilder.append("\t");

        List<String> ingredients = recipe.getIngredientsRawStr();
        if (ingredients != null && !ingredients.isEmpty()) {
            promptBuilder.append("Ingredients:\n");
            for (String ingredient : ingredients) {
                promptBuilder.append("- ")
                        .append(ingredient)
                        .append("\t");
            }
            promptBuilder.append("\t");
        }

        List<String> steps = recipe.getSteps();
        if (steps != null && !steps.isEmpty()) {
            promptBuilder.append("Instructions:\n");
            for (int i = 0; i < steps.size(); i++) {
                promptBuilder.append(i + 1)
                        .append(". ")
                        .append(steps.get(i))
                        .append("\t");
            }
            promptBuilder.append("\t");
        }

        List<String> tags = recipe.getTags();
        if (tags != null && !tags.isEmpty()) {
            promptBuilder.append("Tags: ")
                    .append(String.join(", ", tags))
                    .append("\t");
        }

        promptBuilder.append("Based on the recipe information above, ")
                .append(question);

        return promptBuilder.toString();
    }
}