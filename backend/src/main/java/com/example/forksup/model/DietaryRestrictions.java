package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

public class DietaryRestrictions {

    @Field("health_conscious")
    private List<String> healthConscious;

    @Field("allergies_intolerances")
    private List<String> allergiesIntolerances;

    @Field("lifestyle")
    private List<String> lifestyle;

    public List<String> getHealthConscious() {return healthConscious;}

    public void setHealthConscious(List<String> healthConscious) {this.healthConscious = healthConscious;}

    public List<String> getAllergiesIntolerances() {return allergiesIntolerances;}

    public void setAllergiesIntolerances(List<String> allergiesIntolerances) {
        this.allergiesIntolerances = allergiesIntolerances;
    }

    public List<String> getLifestyle() {return lifestyle;}

    public void setLifestyle(List<String> lifestyle) {this.lifestyle = lifestyle;}

}