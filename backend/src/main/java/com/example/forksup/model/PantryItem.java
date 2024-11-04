package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;

public class PantryItem {

    @DBRef
    private Ingredient ingredient;

    @Field("quantity")
    private Integer quantity;

    public PantryItem() {}

    public PantryItem(Ingredient ingredient, Integer quantity) {
        this.ingredient = ingredient;
        this.quantity = quantity;
    }

    public Ingredient getIngredient() { return ingredient; }

    public void setIngredient(Ingredient ingredient) { this.ingredient = ingredient; }

    public Integer getQuantity() { return quantity; }

    public void setQuantity(Integer quantity) { this.quantity = quantity; }

}
