package com.example.forksup.controller;

import com.example.forksup.model.Ingredient;
import com.example.forksup.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    @Autowired
    private IngredientRepository ingredientRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Ingredient>> searchIngredients(@RequestParam String keyword) {
        System.out.println(keyword);
        List<Ingredient> ingredients = ingredientRepository.findByKeywordSortedByRelevance(keyword);
        return ResponseEntity.ok(ingredients);
    }

}