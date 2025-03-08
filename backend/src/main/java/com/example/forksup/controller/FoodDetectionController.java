package com.example.forksup.controller;

import com.example.forksup.service.FoodDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/food-detection")
public class FoodDetectionController {

    @Autowired
    private FoodDetectionService foodDetectionService;

    @PostMapping("/classify")
    public ResponseEntity<?> classifyImage(@RequestParam("file") MultipartFile file) {
        try {
            byte[] imageBytes = file.getBytes();
            String result = foodDetectionService.classifyImage(imageBytes);
            return ResponseEntity.ok().body(Map.of("result", result));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to process the image"));
        }
    }
}