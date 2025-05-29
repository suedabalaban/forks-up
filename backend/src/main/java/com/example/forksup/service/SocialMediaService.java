//package com.example.forksup.service;
//
//import io.github.bonigarcia.wdm.WebDriverManager;
//import java.time.Duration;
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.chrome.ChromeDriver;
//import org.openqa.selenium.chrome.ChromeOptions;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//import org.openqa.selenium.support.ui.WebDriverWait;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//@Service
//public class SocialMediaService {
//
//    private WebDriver driver;
//
//    @Scheduled(fixedRate = 10000) // Her gün saat 12:00'de
//    public void postToInstagram() {
//        initializeDriver();
//        loginToInstagram("bthnnoz", "Batuhandmr1!");
//        uploadPost("/Users/batuhanoz/Desktop/forks-up/backend/src/main/resources/img.png", "test caption");
//        driver.quit();
//    }
//
//    private void initializeDriver() {
//        WebDriverManager.chromedriver().setup();
//        ChromeOptions options = new ChromeOptions();
//        options.addArguments("--disable-notifications");
//        driver = new ChromeDriver(options);
//    }
//
//    private void loginToInstagram(String username, String password) {
//        driver.get("https://www.instagram.com/accounts/login/");
//
//        WebElement usernameInput = waitForElement(By.name("username"));
//        WebElement passwordInput = waitForElement(By.name("password"));
//        usernameInput.sendKeys(username);
//        passwordInput.sendKeys(password);
//
//        WebElement loginButton = waitForElement(By.xpath("//button[@type='submit']"));
//        loginButton.click();
//
//        try {
//            waitForElement(By.xpath("//button[contains(text(), 'Şimdi Değil')]")).click();
//            waitForElement(By.xpath("//button[contains(text(), 'Bildirimleri Açma')]")).click();
//        } catch (Exception ignored) {}
//    }
//
//    private void uploadPost(String imagePath, String caption) {
//        try {
//            driver.get("https://www.instagram.com/");
//
//            WebElement createButton = waitForElement(By.xpath("/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div[2]/div[7]/div/span/div"));
//            createButton.click();
//
//            WebElement fileInput = waitForElement(By.xpath("//button[text()='Select From Computer']"), 15);
//            fileInput.sendKeys(imagePath);
//
//            WebElement nextButton = waitForElement(By.xpath("//button[contains(text(), 'İleri') or contains(text(), 'Next')]"), 20);
//            nextButton.click();
//
//            WebElement nextAfterFilters = waitForElement(By.xpath("//button[contains(text(), 'İleri') or contains(text(), 'Next')]"), 15);
//            nextAfterFilters.click();
//
//            WebElement captionField = waitForElement(By.xpath("//textarea[contains(@aria-label, 'Açıklama ekle...') or contains(@aria-label, 'Write a caption...')]"), 15);
//            captionField.sendKeys(caption);
//
//            WebElement shareButton = waitForElement(By.xpath("//button[contains(text(), 'Paylaş') or contains(text(), 'Share')]"), 10);
//            shareButton.click();
//
//            waitForElement(By.xpath("//div[contains(text(), 'Gönderin paylaşıldı.') or contains(text(), 'Your post has been shared.')]"), 30);
//
//            System.out.println("Post başarıyla paylaşıldı!");
//
//            Thread.sleep(3000);
//        } catch (Exception e) {
//            System.err.println("Post paylaşılırken bir hata oluştu: " + e.getMessage());
//            e.printStackTrace();
//        }
//    }
//
//    private WebElement waitForElement(By locator) {
//        return waitForElement(locator, 10);
//    }
//
//    private WebElement waitForElement(By locator, int seconds) {
//        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(seconds));
//        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
//    }
//}