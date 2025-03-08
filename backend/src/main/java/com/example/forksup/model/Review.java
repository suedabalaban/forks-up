package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

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

    @Field
    private boolean isVerified;

    @Field
    private boolean isProcessed;

    @Field
    @CreatedDate
    private Date timeStamp;

    public Review(User user, Recipe recipe, String review, int rating, byte[] recipeImage, boolean isVerified,
                  Date timeStamp) {
        this.user = user;
        this.recipe = recipe;
        this.review = review;
        this.rating = rating;
        this.recipeImage = recipeImage;
        this.isVerified = isVerified;
        this.timeStamp = timeStamp;
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

    public String getId() {return id != null ? id.toHexString() : null;}

    public void setId(ObjectId id) {
        this.id = id;
    }

    public boolean isVerified() {return isVerified;}

    public void setIsVerified(boolean verified) {isVerified = verified;}

    public boolean isProcessed() {return isProcessed;}

    public void setIsProcessed(boolean processed) {isProcessed = processed;}

    public Date getTimeStamp() {return timeStamp;}

    public void setTimeStamp(Date timeStamp){this.timeStamp = timeStamp;}

}
