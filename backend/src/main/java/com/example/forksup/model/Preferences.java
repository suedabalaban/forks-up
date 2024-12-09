package com.example.forksup.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
public class Preferences {

    @Field("dietary_restrictions")
    @JsonProperty("dietary_restrictions")
    private DietaryRestrictions dietaryRestrictions;

    @Field("cuisines")
    @JsonProperty("cuisines")
    private List<String> cuisines;

    @Field("preparation_time")
    @JsonProperty("preparation_time")
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

