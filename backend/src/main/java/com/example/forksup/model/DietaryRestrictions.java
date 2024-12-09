package com.example.forksup.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

public class DietaryRestrictions {

    @Field("health_conscious")
    @JsonProperty("health_conscious")
    private List<String> healthConscious;

    @Field("allergies_intolerances")
    @JsonProperty("allergies_intolerances")
    private List<String> allergiesIntolerances;

    @Field("lifestyle")
    @JsonProperty("lifestyle")
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