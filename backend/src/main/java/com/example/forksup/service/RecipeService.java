package com.example.forksup.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    RecipeRepository recipeRepository;

    @Cacheable(value = "recipeSearchCache",
            key = "#keyword + #page + #size",
            unless = "#result.isEmpty()")
    public Page<Recipe> searchRecipesByKeyword(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String searchText = Arrays.stream(keyword.trim().split("\\s+"))
                .map(word -> "\"" + word + "\"")
                .collect(Collectors.joining(" "));

        List<Recipe> recipes = recipeRepository.findByNameTextSearch(searchText, pageable);
        long total = recipeRepository.countByNameTextSearch(searchText);
        return new PageImpl<>(recipes, pageable, total);
    }

}