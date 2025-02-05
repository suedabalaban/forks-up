package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

public class RecipeHistory {
    @DBRef
    private Recipe recipe;

    @Field
    private Date startedAt;

    @Field
    private String review;

    @Field
    private Byte rating;

    @Field
    private byte[] recipeImage;

    public RecipeHistory(Recipe recipe) {
        this.recipe = recipe;
        startedAt = new Date();
    }
    public Recipe getRecipe() {return recipe;}

    public void setRecipe(Recipe recipe) {this.recipe = recipe;}

    public Date getStartedAt() {return startedAt;}

    public void setStartedAt(Date startedAt) {this.startedAt = startedAt;}

    public String getReview() {return review;}

    public void setReview(String review) {this.review = review;}

    public Byte getRating() {return rating;}

    public void setRating(Byte rating) {this.rating = rating;}

    public byte[] getRecipeImage() {return recipeImage;}

    public void setRecipeImage(byte[] recipeImage) {this.recipeImage = recipeImage;}
}
