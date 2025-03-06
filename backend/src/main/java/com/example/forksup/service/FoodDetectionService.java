package com.example.forksup.service;

import ai.onnxruntime.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.nio.FloatBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Map;

@Service
public class FoodDetectionService {

    private static final String MODEL_PATH = "src/main/resources/version2.onnx";
    private static final int IMG_SIZE = 224;
    private static final float THRESHOLD = 0.5f;

    private OrtEnvironment env;
    private OrtSession session;

    public FoodDetectionService() throws OrtException {
        this.env = OrtEnvironment.getEnvironment();
        this.session = env.createSession(MODEL_PATH, new OrtSession.SessionOptions());
    }

    public String classifyImage(MultipartFile file) {
        try {
            BufferedImage img = preprocessImage(file);
            float[] imgData = imageToFloatArray(img);

            // ONNX model girişini oluştur
            OnnxTensor inputTensor = OnnxTensor.createTensor(env, FloatBuffer.wrap(imgData), new long[]{1, 3, IMG_SIZE, IMG_SIZE});
            Map<String, OnnxTensor> inputs = Collections.singletonMap("input", inputTensor);

            // Modeli çalıştır
            OrtSession.Result result = session.run(inputs);
            float[][] output = (float[][]) result.get(0).getValue();

            // Food sınıfı için olasılığı al
            float foodProbability = output[0][1]; // Modelin food class için tahmini

            // Eğer olasılık threshold'u geçerse "Food", yoksa "Non-Food" döndür
            return foodProbability >= THRESHOLD ? "Food" : "Non-Food";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing image";
        }
    }

    private BufferedImage preprocessImage(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
        BufferedImage originalImage = ImageIO.read(inputStream);

        Image scaledImage = originalImage.getScaledInstance(IMG_SIZE, IMG_SIZE, Image.SCALE_SMOOTH);
        BufferedImage resizedImage = new BufferedImage(IMG_SIZE, IMG_SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        g2d.drawImage(scaledImage, 0, 0, null);
        g2d.dispose();
        return resizedImage;
    }

    private float[] imageToFloatArray(BufferedImage img) {
        float[] imgData = new float[3 * IMG_SIZE * IMG_SIZE];
        int[] pixelData = new int[IMG_SIZE * IMG_SIZE];
        img.getRGB(0, 0, IMG_SIZE, IMG_SIZE, pixelData, 0, IMG_SIZE);

        for (int i = 0; i < pixelData.length; i++) {
            int pixel = pixelData[i];
            imgData[i] = ((pixel >> 16) & 0xFF) / 255.0f; // Red
            imgData[i + IMG_SIZE * IMG_SIZE] = ((pixel >> 8) & 0xFF) / 255.0f; // Green
            imgData[i + 2 * IMG_SIZE * IMG_SIZE] = (pixel & 0xFF) / 255.0f; // Blue
        }
        return imgData;
    }
}
