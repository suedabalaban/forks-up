package com.example.forksup.controller;

import com.example.forksup.model.PantryItem;
import com.example.forksup.service.PantryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/pantry")
public class PantryController {

    private final PantryService pantryService;

    public PantryController(PantryService pantryService) {
        this.pantryService = pantryService;
    }

    /**
     * Retrieves the user's virtual pantry containing all stored ingredients.
     * The pantry is a persistent storage of ingredients that the user has available
     * for cooking, including their quantities.
     *
     * @param request HTTP request containing user session
     * @return ResponseEntity with List of PantryItem objects
     */
    @GetMapping(path = "")
    public ResponseEntity<List<PantryItem>> getUserPantry(HttpServletRequest request) {
        String uid = (String) request.getSession().getAttribute("uid");
        List<PantryItem> pantryItems = pantryService.getUserPantryItems(uid);
        return ResponseEntity.ok(pantryItems);
    }

    /**
     * Adds a new ingredient to the user's pantry with specified quantity.
     * This endpoint creates a new pantry entry if the ingredient doesn't exist,
     * managing the relationship between users and their available ingredients.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient
     * @param quantity Amount of the ingredient to add
     * @return ResponseEntity with HTTP 201 (CREATED) on successful addition
     */
    @PostMapping(path = "")
    public ResponseEntity<Void> addIngredientToPantry(
            HttpServletRequest request,
            @RequestParam String ingredientId,
            @RequestParam Integer quantity,
            @RequestParam String unit
    ) {
        String uid = (String) request.getSession().getAttribute("uid");
        pantryService.addIngredientToPantry(uid, ingredientId, quantity, unit);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * Updates the quantity of an existing ingredient in the user's pantry.
     * This endpoint modifies the amount of an ingredient without changing other
     * properties or relationships.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient
     * @param quantity New quantity to set
     * @return ResponseEntity with updated PantryItem
     */
    @PutMapping(path = "/{ingredientId}")
    public ResponseEntity<PantryItem> updateIngredientQuantity(
            HttpServletRequest request,
            @PathVariable String ingredientId,
            @RequestParam Integer quantity,
            @RequestParam String unit) {
        String uid = (String) request.getSession().getAttribute("uid");
        PantryItem updatedItem = pantryService.updateIngredientQuantity(uid, ingredientId, quantity, unit);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Removes an ingredient entirely from the user's pantry.
     * This endpoint deletes the association between user and ingredient in the pantry,
     * typically used when an ingredient is depleted or no longer needed.
     *
     * @param request HTTP request containing user session
     * @param ingredientId Unique identifier of the ingredient to remove
     * @return ResponseEntity with HTTP 204 (NO_CONTENT) on successful removal
     */
    @DeleteMapping(path = "/{ingredientId}")
    public ResponseEntity<Void> removeIngredientFromPantry(
            HttpServletRequest request,
            @PathVariable String ingredientId) {
        String uid = (String) request.getSession().getAttribute("uid");
        pantryService.removeIngredientFromPantry(uid, ingredientId);
        return ResponseEntity.noContent().build();
    }

}
