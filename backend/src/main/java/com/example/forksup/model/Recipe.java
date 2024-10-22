package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "recipes")
public class Recipe {

    @Id
    private ObjectId id;
    private Long recipeId;  
    private String name;
    private String description;
    private List<String> ingredients;
    private List<String> ingredientsRawStr;
    private String servingSize;
    private int servings;
    private List<String> steps;
    private List<String> tags;
    private List<String> searchTerms;

    // Constructors
    public Recipe() {}

    public Recipe(ObjectId id, Long recipeId, String name, String description, List<String> ingredients, 
                  List<String> ingredientsRawStr, String servingSize, int servings, List<String> steps, 
                  List<String> tags, List<String> searchTerms) {
        this.id = id;
        this.recipeId = recipeId;
        this.name = name;
        this.description = description;
        this.ingredients = ingredients;
        this.ingredientsRawStr = ingredientsRawStr;
        this.servingSize = servingSize;
        this.servings = servings;
        this.steps = steps;
        this.tags = tags;
        this.searchTerms = searchTerms;
    }

    // Getters and Setters
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getIngredientsRawStr() {
        return ingredientsRawStr;
    }

    public void setIngredientsRawStr(List<String> ingredientsRawStr) {
        this.ingredientsRawStr = ingredientsRawStr;
    }

    public String getServingSize() {
        return servingSize;
    }

    public void setServingSize(String servingSize) {
        this.servingSize = servingSize;
    }

    public int getServings() {
        return servings;
    }

    public void setServings(int servings) {
        this.servings = servings;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getSearchTerms() {
        return searchTerms;
    }

    public void setSearchTerms(List<String> searchTerms) {
        this.searchTerms = searchTerms;
    }
}
