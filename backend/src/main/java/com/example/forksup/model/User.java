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

    @Field("ingredients")
    private Ingredients ingredients;

    @DBRef
    @Field("favorites")
    private List<Recipe> favorites;

    public User() {}

    public User (
            ObjectId id,
            String firebaseId,
            Preferences preferences,
            Ingredients ingredients,
            List<Recipe> favorites
    )
    {
        this.id = id;
        this.firebaseId = firebaseId;
        this.preferences = preferences;
        this.ingredients = ingredients;
        this.favorites = favorites;
    }

    public String getId() {
        return id != null ? id.toHexString() : null;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getFirebaseId() {
        return firebaseId;
    }

    public void setFirebaseId(String firebaseId) {
        this.firebaseId = firebaseId;
    }

    public Ingredients getIngredients() {
        return ingredients;
    }

    public void setIngredients(Ingredients ingredients) {
        this.ingredients = ingredients;
    }

    public Preferences getPreferences() {
        return preferences;
    }

    public void setPreferences(Preferences preferences) {
        this.preferences = preferences;
    }

    public List<Recipe> getFavorites() {return favorites;}

    public void setFavorites(List<Recipe> favorites) {this.favorites = favorites;}

}