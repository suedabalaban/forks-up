package com.example.forksup.controller;

import com.example.forksup.service.RecipeService;
import com.example.forksup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    UserService userService;

    @Autowired
    RecipeService recipeService;

}
