package com.example.forksup.service;


import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.model.Recipe;
import com.example.forksup.model.User;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    public User getUserById(String id) {
        ObjectId idObj = new ObjectId(id);
        User u = userRepository.findById(idObj).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u;
    }

    public User insertUser(User user) {
        User u = userRepository.findUserByFirebaseId(user.getFirebaseId()).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        if (u != null) {
            return null;
        }
        u = userRepository.insert(user);
        return u;
    }

    public User addRecipeToFavorites(String firebaseId, String recipeId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe r = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        if (u.getFavorites() == null) {
            u.setFavorites(new ArrayList<Recipe>());
        }
        if (!u.getFavorites().contains(r)) {
            u.getFavorites().add(r);
            userRepository.save(u);
        }
        return u;
    }

    public User removeRecipeFromFavorites(String firebaseId, String recipeId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        Recipe r = recipeRepository.findById(new ObjectId(recipeId)).orElseThrow(() ->
                new ResourceNotFoundException("Recipe not found")
        );
        u.getFavorites().remove(r);
        userRepository.save(u);
        return u;
    }

    public List<Recipe> getFavoriteRecipes(String firebaseId) {
        User u = userRepository.findUserByFirebaseId(firebaseId).orElseThrow(() ->
                new ResourceNotFoundException("User not found")
        );
        return u.getFavorites();
    }

}
