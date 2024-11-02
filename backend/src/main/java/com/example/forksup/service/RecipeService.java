package com.example.forksup.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import java.util.List;

@Service
public class RecipeService {

    @Autowired
    RecipeRepository recipeRepository;

    public List<Recipe> searchRecipesByNameRegex(String keyword, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            return recipeRepository.findByNameRegex(keyword, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Tarif araması sırasında bir hata oluştu", e);
        }
    }

}
 