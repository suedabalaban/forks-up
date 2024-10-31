package com.example.forksup.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired 
    private MongoTemplate mongoTemplate;

    //criteria.regex
    public Page<Recipe> searchRecipesByNameRegex(String keyword, Pageable pageable) {
        return recipeRepository.findByNameRegex(keyword, pageable);
    }
}
 