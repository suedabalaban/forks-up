package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;

public class PantryItem {

    @DBRef
    private Ingredient ingredient;

    @Field("quantity")
    private Integer quantity;

    @Field("measurement_unit")
    private String measurementUnit;

    public PantryItem() {}

    public PantryItem(Ingredient ingredient, Integer quantity, String measurementUnit) {
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.measurementUnit = measurementUnit;
    }

    public Ingredient getIngredient() { return ingredient; }

    public void setIngredient(Ingredient ingredient) { this.ingredient = ingredient; }

    public Integer getQuantity() { return quantity; }

    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getMeasurementUnit() { return measurementUnit; }

    public void setMeasurementUnit(String measurementUnit) { this.measurementUnit = measurementUnit; }

}
