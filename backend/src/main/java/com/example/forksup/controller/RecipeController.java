package com.example.forksup.controller;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.RecipeService;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes/")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private PagedResourcesAssembler<Recipe> pagedResourcesAssembler;

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable("id") String id) {
        if (id == null || id.length() != 24) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        try {
            ObjectId idObj = new ObjectId(id);
            Recipe recipe = recipeRepository.findById(idObj).orElse(null);

            if (recipe == null) {
                return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(recipe, null, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
    }

    //Criteria sınıfının regex() fonksiyonu kullanılarak yapılan arama
    @GetMapping("/search-regex")
    public ResponseEntity<PagedModel<EntityModel<Recipe>>> searchRecipesRegex(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Boş veya null keyword kontrolü
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        // RecipeService aracılığıyla regex araması gerçekleştirilip sonuçlar alınır
        PagedModel<EntityModel<Recipe>> pagedModel = recipeService.searchRecipesByNameRegex(keyword, page, size);

        // Eğer sonuçlar boşsa NOT_FOUND durumuyla dönüş yap
        if (pagedModel.getContent().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // Başarılı durumda, bulunan tarifleri içeren yanıt dönülür
        return ResponseEntity.ok(pagedModel);
    }
}