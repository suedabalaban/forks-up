package com.example.forksup.service;

import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.Ingredient;
import com.example.forksup.model.PantryItem;
import com.example.forksup.model.User;
import com.example.forksup.repository.IngredientRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PantryService {

    private final UserRepository userRepository;

    private final IngredientRepository ingredientRepository;

    PantryService(UserRepository userRepository, IngredientRepository ingredientRepository) {
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<PantryItem> getUserPantryItems(String firebaseId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u.getPantryItems();
    }

    public void addIngredientToPantry(String firebaseId, String ingredientId, Integer quantity, String unit) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null) {
            u.setPantryItems(new ArrayList<>());
        }
        List<PantryItem> pantryItems = u.getPantryItems();
        PantryItem existingPantryItem = pantryItems.stream()
                .filter(item -> item.getIngredient().getId().equals(i.getId()))
                .findFirst()
                .orElse(null);

        if (existingPantryItem == null) {
            PantryItem newPantryItem = new PantryItem();
            newPantryItem.setIngredient(i);
            newPantryItem.setQuantity(quantity);
            newPantryItem.setMeasurementUnit(unit);
            pantryItems.add(newPantryItem);
        } else {
            existingPantryItem.setQuantity(quantity);
        }
        u.setPantryItems(pantryItems);
        userRepository.save(u);
    }

    public PantryItem updateIngredientQuantity(String firebaseId, String ingredientId, Integer quantity, String unit) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null) {
            throw new ResourceNotFoundException("Pantry is empty");
        }
        PantryItem pantryItem = u.getPantryItems().stream()
                .filter(item -> item.getIngredient().getId().equals(i.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found in pantry"));
        pantryItem.setQuantity(quantity);
        pantryItem.setMeasurementUnit(unit);

        userRepository.save(u);
        return pantryItem;
    }

    public void removeIngredientFromPantry(String firebaseId, String ingredientId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Ingredient i = ingredientRepository.findById(new ObjectId(ingredientId)).orElseThrow(() ->
                new ResourceNotFoundException("Ingredient not found")
        );
        if (u.getPantryItems() == null || u.getPantryItems().isEmpty()) {
            throw new ResourceNotFoundException("Pantry is empty");
        }
        boolean removed = u.getPantryItems().removeIf(item -> item.getIngredient().getId().equals(i.getId()));
        if (!removed) {
            throw new ResourceNotFoundException("Ingredient not found in pantry");
        }
        userRepository.save(u);
    }

}
