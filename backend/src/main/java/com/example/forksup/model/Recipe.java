package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Objects;

@Document(collection = "recipes")
public class Recipe {

    @Id
    private ObjectId id;

    @Field("id")
    private Long recipeId;

    @TextIndexed
    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @DBRef
    @Field("ingredients")
    private List<Ingredient> ingredients;

    @Field("ingredients_raw_str")
    private List<String> ingredientsRawStr;

    @Field("serving_size")
    private String serving_size;

    @Field("servings")
    private int servings;

    @Field("steps")
    private List<String> steps;

    @Indexed
    @Field("tags")
    private List<String> tags;

    @Field("search_terms")
    private List<String> searchTerms;

    public Recipe() {}

    public Recipe(ObjectId id, Long recipeId, String name, String description, List<Ingredient> ingredients,
                  List<String> ingredientsRawStr, String serving_size, int servings, List<String> steps,
                  List<String> tags, List<String> searchTerms) {
        this.id = id;
        this.recipeId = recipeId;
        this.name = name;
        this.description = description;
        this.ingredients = ingredients;
        this.ingredientsRawStr = ingredientsRawStr;
        this.serving_size = serving_size;
        this.servings = servings;
        this.steps = steps;
        this.tags = tags;
        this.searchTerms = searchTerms;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Recipe recipe = (Recipe) o;
        return Objects.equals(id, recipe.id);
    }

    @Override
    public int hashCode() {return Objects.hash(id);}

    public ObjectId getObjectId() {return id;}

    public String getId() {return id != null ? id.toHexString() : null;}
    
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

    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getIngredientsRawStr() {
        return ingredientsRawStr;
    }

    public void setIngredientsRawStr(List<String> ingredientsRawStr) {
        this.ingredientsRawStr = ingredientsRawStr;
    }

    public String getServing_size() {
        return serving_size;
    }

    public void setServing_size(String serving_size) {
        this.serving_size = serving_size;
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
