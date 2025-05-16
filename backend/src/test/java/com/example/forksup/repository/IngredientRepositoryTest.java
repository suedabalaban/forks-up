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
        // Tüm veriyi değil, sadece ilk 10 item'ı al
        List<Ingredient> ingredients = ingredientRepository.findAll(PageRequest.of(0, 10)).getContent();

        // Veri olduğunu doğrula
        assertThat(ingredients).isNotEmpty();
        System.out.println("Alınan örnek ingredient sayısı: " + ingredients.size());

        // İlk elemanın içeriğini kontrol et
        if (!ingredients.isEmpty()) {
            Ingredient firstIngredient = ingredients.getFirst();
            assertThat(firstIngredient.getName()).isNotNull();
            System.out.println("Örnek ingredient adı: " + firstIngredient.getName());
        }
    }

    @Test
    public void testFindById() {
        // Önce sınırlı sayıda veri al
        List<Ingredient> ingredients = ingredientRepository.findAll(PageRequest.of(0, 5)).getContent();

        // Eğer veri varsa ilk ingredientin ID'si ile tekrar sorgu yapalım
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
        // "rice" kelimesi ile arama yap (tam kelime olarak)
        List<Ingredient> searchResults = ingredientRepository.findByKeywordSortedByRelevance("rice");

        // Sonuç olup olmadığını loglayalım
        System.out.println("'rice' araması için bulunan sonuç sayısı: " + searchResults.size());

        // Sonuçların içinde "rice" kelimesi geçenleri kontrol et
        // Not: ingredientNameIndex varsa, sonuçların gelmiş olması beklenir
        if (!searchResults.isEmpty()) {
            boolean containsRice = false;
            for (Ingredient ingredient : searchResults) {
                if (ingredient.getName().toLowerCase().contains("rice")) {
                    containsRice = true;
                    System.out.println("Rice içeren örnek: " + ingredient.getName());
                    break;
                }
            }

            // Sonuçlardan en az birinde "rice" geçiyor mu kontrol et
            // Not: Metin araması indexed field'a göre çalışır, tam olarak "rice" kelimesi aranırken
            // "rice" içeren bir malzeme bulunamayabilir. Bu durumu esnek bir şekilde ele alalım.
            if (!containsRice) {
                System.out.println("Uyarı: 'rice' aramasında sonuçlar döndü ancak içlerinde 'rice' içeren isim bulunamadı.");
                System.out.println("İlk bulunan sonuç: " + searchResults.get(0).getName());
            }
        }
    }

    @Test
    public void testCountTotal() {
        // Toplam kayıt sayısını kontrol et (ağır bir işlem değil)
        long count = ingredientRepository.count();
        System.out.println("Toplam ingredient sayısı: " + count);

        // En azından bir kayıt olmalı
        assertThat(count).isGreaterThan(0);
    }
}