package com.example.forksup.controller;

import com.example.forksup.service.FoodDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/food-detection")
public class FoodDetectionController {

    @Autowired
    private FoodDetectionService foodDetectionService;

    @PostMapping("/classify")
    public ResponseEntity<?> classifyImage(@RequestParam("file") MultipartFile file) {
        String result = foodDetectionService.classifyImage(file);
        return ResponseEntity.ok().body(Map.of("result", result));
    }
}