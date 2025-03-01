package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.Ingredient;
import com.example.forksup.repository.IngredientRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    public Ingredient findById(String ingredientId) {
        return ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
    }

    public List<Ingredient> findByIngredientName(String ingredientName) {
        return ingredientRepository.findByKeywordSortedByRelevance(ingredientName);
    }

}
