package com.example.forksup.repository;

import com.example.forksup.model.Ingredient;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class IngredientRepositoryTest {

    @Autowired
    private IngredientRepository ingredientRepository;

    @Test
    public void testFindWithLimit() {
        List<Ingredient> ingredients = ingredientRepository.findAll(PageRequest.of(0, 10)).getContent();

        assertThat(ingredients).isNotEmpty();
        System.out.println("Alınan örnek ingredient sayısı: " + ingredients.size());

        if (!ingredients.isEmpty()) {
            Ingredient firstIngredient = ingredients.getFirst();
            assertThat(firstIngredient.getName()).isNotNull();
            System.out.println("Örnek ingredient adı: " + firstIngredient.getName());
        }
    }

    @Test
    public void testFindById() {
        List<Ingredient> ingredients = ingredientRepository.findAll(PageRequest.of(0, 5)).getContent();

        if (!ingredients.isEmpty()) {
            ObjectId id = ingredients.getFirst().getObjectId();
            Optional<Ingredient> foundIngredient = ingredientRepository.findById(id);

            assertThat(foundIngredient).isPresent();
            assertThat(foundIngredient.get().getObjectId()).isEqualTo(id);
        } else {
            System.out.println("Test için ingredient verisi bulunamadı!");
        }
    }

    @Test
    public void testFindByKeywordSortedByRelevance() {
        List<Ingredient> searchResults = ingredientRepository.findByKeywordSortedByRelevance("rice");

        System.out.println("'rice' araması için bulunan sonuç sayısı: " + searchResults.size());

        if (!searchResults.isEmpty()) {
            boolean containsRice = false;
            for (Ingredient ingredient : searchResults) {
                if (ingredient.getName().toLowerCase().contains("rice")) {
                    containsRice = true;
                    System.out.println("Rice içeren örnek: " + ingredient.getName());
                    break;
                }
            }

            if (!containsRice) {
                System.out.println("İlk bulunan sonuç: " + searchResults.getFirst().getName());
            }
        }
    }

    @Test
    public void testCountTotal() {
        long count = ingredientRepository.count();
        System.out.println("Toplam ingredient sayısı: " + count);

        assertThat(count).isGreaterThan(0);
    }
}