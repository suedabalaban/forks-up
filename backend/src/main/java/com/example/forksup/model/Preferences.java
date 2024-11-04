package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
public class Preferences {

    @Field("dietary_restrictions")
    private DietaryRestrictions dietaryRestrictions;

    @Field("cuisines")
    private List<String> cuisines;

    @Field("preparation_time")
    private String preparationTime;

    public DietaryRestrictions getDietaryRestrictions() {
        return dietaryRestrictions;
    }

    public void setDietaryRestrictions(DietaryRestrictions dietaryRestrictions) {
        this.dietaryRestrictions = dietaryRestrictions;
    }

    public List<String> getCuisines() {
        return cuisines;
    }

    public void setCuisines(List<String> cuisines) {
        this.cuisines = cuisines;
    }

    public String getPreparation_time() {return preparationTime;}

    public void setPreparation_time(String preparation_time) {this.preparationTime = preparation_time;}

}

