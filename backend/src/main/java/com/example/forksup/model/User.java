package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;


import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private ObjectId id;

    @Field("firebase_id")
    private String firebase_id;

    @Field("preferences")
    private Preferences preferences;

    @Field("ingredients")
    private Ingredients ingredients;

    public ObjectId get_id() {
        return id;
    }

    public void set_id(ObjectId id) {
        this.id = id;
    }

    public String getFirebase_id() {
        return firebase_id;
    }

    public void setFirebase_id(String firebase_id) {
        this.firebase_id = firebase_id;
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

}