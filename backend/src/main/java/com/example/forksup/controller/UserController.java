package com.example.forksup.controller;

import com.example.forksup.model.Ingredient;
import com.example.forksup.model.Recipe;
import com.example.forksup.model.User;
import com.example.forksup.repository.UserRepository;
import com.example.forksup.service.UserService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping(path = "/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        User u =  userService.getUserById(id);
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(u, null, HttpStatus.OK);
    }

    @PutMapping(path = "")
    public ResponseEntity<String> createUser(HttpServletRequest request) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        User u = userService.insertUser(new User(
                null,
                firebaseToken.getUid(),
                null,
                null,
                null)
        );
        if (u == null) {
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @GetMapping("/favorite/{recipeId}")
    public ResponseEntity<Boolean> isRecipeInFavorites(HttpServletRequest request, @PathVariable String recipeId) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        boolean isFavorite = userService.isRecipeInFavorites(firebaseToken.getUid(), recipeId);
        return ResponseEntity.ok(isFavorite);
    }

    @PutMapping(path = "/favorite/{recipeId}")
    public ResponseEntity<String> addFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        userService.addRecipeToFavorites(firebaseToken.getUid(), recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @DeleteMapping( path = "/favorite/{recipeId}")
    public ResponseEntity<String> removeFavorite(HttpServletRequest request, @PathVariable("recipeId") String recipeId) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        userService.removeRecipeFromFavorites(firebaseToken.getUid(), recipeId);
        return new ResponseEntity<>(null, null, HttpStatus.OK);
    }

    @GetMapping(path = "/favorite/all")
    public ResponseEntity<List<Recipe>> getFavorites(HttpServletRequest request) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        List<Recipe> recipes = userService.getFavoriteRecipes(firebaseToken.getUid());
        return new ResponseEntity<>(recipes, null, HttpStatus.OK);
    }

    @GetMapping(path = "/pantry")
    public ResponseEntity<List<Ingredient>> getPantry(HttpServletRequest request) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getSession().getAttribute("FirebaseToken");
        //
        return null;
    }

}
