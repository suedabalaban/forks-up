package com.example.forksup.repository;

import com.example.forksup.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomRecipeRepository{
    Page<Recipe> findByNameRegex(String keyword, Pageable pageable);
}
