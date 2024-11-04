package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "ingredients")
public class Ingredient {

    @Id
    private ObjectId id;

    @Field("name")
    private String name;

    public ObjectId getObjectId() {return id;}

    public String getId() {return id != null ? id.toHexString() : null;}

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {return name;}

    public void setIngredient(String name) {this.name = name;}

}
