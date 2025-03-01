package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

public class RecipeHistory {

    @DBRef
    private Recipe recipe;

    @Field
    private Date startedAt;

    public RecipeHistory(Recipe recipe) {
        this.recipe = recipe;
        startedAt = new Date();
    }

    public Recipe getRecipe() {return recipe;}

    public void setRecipe(Recipe recipe) {this.recipe = recipe;}

    public Date getStartedAt() {return startedAt;}

    public void setStartedAt(Date startedAt) {this.startedAt = startedAt;}

}
