package com.example.forksup.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

import java.util.Collections;
import java.util.List;

@Service
public class RecipeService {

    @Autowired
    RecipeRepository recipeRepository;

    public List<Recipe> searchRecipesByNameRegex(String keyword, int page, int size) {
        if (page == 0) {
            return recipeRepository.findFirstPage(keyword,
                    PageRequest.of(0, size, Sort.by("_id").ascending()));
        }

        List<Recipe> previousPage = recipeRepository.findFirstPage(keyword,
                PageRequest.of(page - 1, size, Sort.by("_id").ascending()));

        if (previousPage.isEmpty()) {
            return Collections.emptyList();
        }

        ObjectId lastId = previousPage.get(previousPage.size() - 1).getObjectId();

        return recipeRepository.findNextPage(keyword, lastId,
                PageRequest.of(0, size, Sort.by("_id").ascending()));
    }

}
 