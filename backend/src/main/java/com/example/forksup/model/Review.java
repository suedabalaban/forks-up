package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "reviews")
public class Review {

    @Id
    private ObjectId id;

    @DBRef
    private User user;

    @DBRef
    private Recipe recipe;

    @Field
    private String review;

    @Field
    private int rating;

    @Field
    private byte[] recipeImage;

    public Review(User user, Recipe recipe, String review, int rating, byte[] recipeImage) {
        this.user = user;
        this.recipe = recipe;
        this.review = review;
        this.rating = rating;
        this.recipeImage = recipeImage;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(Byte rating) {
        this.rating = rating;
    }

    public byte[] getRecipeImage() {
        return recipeImage;
    }

    public void setRecipeImage(byte[] recipeImage) {
        this.recipeImage = recipeImage;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

}
