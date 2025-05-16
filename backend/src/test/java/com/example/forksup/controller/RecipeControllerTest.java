package com.example.forksup.controller;

import com.example.forksup.config.DevConfig;
import com.example.forksup.config.SecurityConfig;
import com.example.forksup.exception.ResourceNotFoundException;
import com.example.forksup.filter.FirebaseAuthenticationFilter;
import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;
import com.example.forksup.service.RecipeService;
import com.example.forksup.service.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = RecipeController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                FirebaseAuthenticationFilter.class,
                SecurityConfig.class
        })
})
@AutoConfigureMockMvc(addFilters = false)  // Security filtrelerini devre dışı bırak
public class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecipeRepository recipeRepository;

    @MockBean
    private RecipeService recipeService;

    @MockBean
    private ReviewService reviewService;

    private Recipe testRecipe1;
    private Recipe testRecipe2;
    private List<Recipe> testRecipes;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public DevConfig devConfig() {
            return new DevConfig() {
                @Override
                public boolean isDevMode() {
                    return true;
                }

                @Override
                public String getDevAdminToken() {
                    return "test-admin-token";
                }

                @Override
                public boolean isDevAdminToken(String token) {
                    return true;
                }
            };
        }

        // Test için güvenlik konfigürasyonunu iptal eden bir Bean
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(authorize ->
                            authorize.anyRequest().permitAll()
                    );
            return http.build();
        }
    }

    @BeforeEach
    public void setup() {
        // Test verileri oluştur
        testRecipe1 = new Recipe();
        testRecipe1.setId(new ObjectId("6553a72a9a5b5f7a6fc03e11"));
        testRecipe1.setName("Spagetti Bolognese");
        testRecipe1.setDescription("Klasik İtalyan makarnası");
        testRecipe1.setTags(Arrays.asList("İtalyan", "Makarna"));

        testRecipe2 = new Recipe();
        testRecipe2.setId(new ObjectId("6553a72a9a5b5f7a6fc03e22"));
        testRecipe2.setName("Veggie Pad Thai");
        testRecipe2.setDescription("Tay usulü sebzeli noodle");
        testRecipe2.setTags(Arrays.asList("Tay", "Vejetaryen"));

        testRecipes = Arrays.asList(testRecipe1, testRecipe2);
    }

    @Test
    public void testGetRecipeByIdNotFound() throws Exception {
        // Service'in davranışını mock'la - ResourceNotFoundException fırlat
        when(recipeService.getByRecipeId(eq("6553a72a9a5b5f7a6fc03e99")))
                .thenThrow(new ResourceNotFoundException("Recipe with id 6553a72a9a5b5f7a6fc03e99 not found"));

        // API çağrısı ve 404 yanıtını test et
        mockMvc.perform(get("/api/recipes/6553a72a9a5b5f7a6fc03e99"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testSearchRecipesWithKeyword() throws Exception {
        // Arama sonuçlarını simüle et
        Slice<Recipe> slice = new SliceImpl<>(testRecipes, PageRequest.of(0, 10), false);
        when(recipeService.searchRecipes(
                eq("pasta"),
                eq(null),
                eq(null),
                eq(0),
                eq(10)))
                .thenReturn(slice);

        // API çağrısını ve sonuçlarını test et
        mockMvc.perform(get("/api/recipes/search")
                        .param("keyword", "pasta")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].name", is("Spagetti Bolognese")))
                .andExpect(jsonPath("$.content[1].name", is("Veggie Pad Thai")));
    }

    @Test
    public void testSearchRecipesWithTagsAndIngredients() throws Exception {
        // Arama sonuçlarını simüle et - sadece bir tarif içeren sonuç
        Slice<Recipe> slice = new SliceImpl<>(Collections.singletonList(testRecipe1),
                PageRequest.of(0, 10), false);

        List<String> tags = Collections.singletonList("İtalyan");
        List<String> ingredients = Collections.singletonList("domates");

        when(recipeService.searchRecipes(
                isNull(),
                eq(tags),
                eq(ingredients),
                eq(0),
                eq(10)))
                .thenReturn(slice);

        // API çağrısını ve sonuçlarını test et
        mockMvc.perform(get("/api/recipes/search")
                        .param("tags", "İtalyan")
                        .param("ingredients", "domates")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Spagetti Bolognese")));
    }

    @Test
    public void testSearchRecipesEmptyResult() throws Exception {
        // Boş sonuç dön
        Slice<Recipe> emptySlice = new SliceImpl<>(new ArrayList<>(),
                PageRequest.of(0, 10), false);

        when(recipeService.searchRecipes(
                eq("bulunamayacak"),
                isNull(),
                isNull(),
                eq(0),
                eq(10)))
                .thenReturn(emptySlice);

        // API çağrısını ve boş sonuçları test et
        mockMvc.perform(get("/api/recipes/search")
                        .param("keyword", "bulunamayacak")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }
}