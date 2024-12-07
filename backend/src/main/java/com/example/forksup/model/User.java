package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private ObjectId id;

    @Field("firebase_id")
    private String firebaseId;

    @Field("preferences")
    private Preferences preferences;

    @Field("pantry_items")
    private List<PantryItem> pantryItems;

    @DBRef
    @Field("favorites")
    private List<Recipe> favorites;

    @Field("recipe_history")
    private List<RecipeHistory> recipeHistory;

    public User() {}

    public User (
            ObjectId id,
            String firebaseId,
            Preferences preferences,
            List<PantryItem> pantryItems,
            List<Recipe> favorites
    )
    {
        this.id = id;
        this.firebaseId = firebaseId;
        this.preferences = preferences;
        this.pantryItems = pantryItems;
        this.favorites = favorites;
    }

    public String getId() {return id != null ? id.toHexString() : null;}

    public void setId(ObjectId id) {this.id = id;}

    public String getFirebaseId() {
        return firebaseId;
    }

    public void setFirebaseId(String firebaseId) {
        this.firebaseId = firebaseId;
    }

    public List<PantryItem> getPantryItems() {return pantryItems;}

    public void setPantryItems(List<PantryItem> pantryItems) {
        this.pantryItems = pantryItems;
    }

    public Preferences getPreferences() {
        return preferences;
    }

    public void setPreferences(Preferences preferences) {
        this.preferences = preferences;
    }

    public List<Recipe> getFavorites() {return favorites;}

    public void setFavorites(List<Recipe> favorites) {this.favorites = favorites;}

    public List<RecipeHistory> getRecipeHistory() {return recipeHistory;}

    public void setRecipeHistory(List<RecipeHistory> recipeHistory) {this.recipeHistory = recipeHistory;}
}