package com.example.forksup.model;

import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

public class Ingredients {

    @Field("proteins")
    private List<String> proteins;

    @Field("vegetables")
    private List<String> vegetables;

    @Field("fruits")
    private List<String> fruits;

    @Field("grains")
    private List<String> grains;

    @Field("dairy")
    private List<String> dairy;

    public List<String> getProteins() {return proteins;}

    public void setProteins(List<String> proteins) {this.proteins = proteins;}

    public List<String> getVegetables() {return vegetables;}

    public void setVegetables(List<String> vegetables) {this.vegetables = vegetables;}

    public List<String> getFruits() {return fruits;}

    public void setFruits(List<String> fruits) {this.fruits = fruits;}

    public List<String> getGrains() {return grains;}

    public void setGrains(List<String> grains) {this.grains = grains;}

    public List<String> getDairy() {return dairy;}

    public void setDairy(List<String> dairy) {this.dairy = dairy;}

}
