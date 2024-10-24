package com.example.forksup.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

@Service
public class RecipeService {
    
    private static final int MAX_RESULTS = 10;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired 
    private MongoTemplate mongoTemplate;
    
    //test-index
    public List<Recipe> searchRecipesByName(String keyword, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        return recipeRepository.findByNameTextSearch(keyword, pageRequest);
    }

    //criteria.regex
    public List<Recipe> searchRecipesByNameRegex(String keyword) {
        Query query = new Query();
        query.addCriteria(Criteria.where("name")
                .regex(keyword, "i"));  // "i" flag'i case-insensitive arama sağlar
        query.limit(MAX_RESULTS);
        return mongoTemplate.find(query, Recipe.class);
    }
}
 