package com.tutofox.ecommerce.Utils;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class AesUtil {
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static Map<String, String> envVariables;

    static {
        try {
            envVariables = readEnvFile("F:/android/eKMA/FE/eKMA/.env");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public AesUtil() throws IOException {
    }

    public static Map<String, String> readEnvFile(String filePath) throws IOException {
        Map<String, String> envVariables = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty() || line.startsWith("#")) {
                    continue;
                }
                String[] parts = line.split("=", 2);
                if (parts.length == 2) {
                    envVariables.put(parts[0].trim(), parts[1].trim());
                }
            }
        }
        return envVariables;
    }

    public static String encrypt(String data) throws Exception {
        byte[] decodedIv = Base64.getDecoder().decode(envVariables.get("IV"));

        SecretKeySpec keySpec = new SecretKeySpec(envVariables.get("KEY").getBytes(), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(decodedIv);

        // Khởi tạo Cipher với chế độ AES/CBC/PKCS5Padding
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

        // Mã hóa dữ liệu
        byte[] encryptedBytes = cipher.doFinal(data.getBytes("UTF-8"));

        // Chuyển dữ liệu đã mã hóa thành Base64
        String encryptedData = Base64.getEncoder().encodeToString(encryptedBytes);

        return encryptedData;
    }

    public static String decrypt(String encryptedData, String ivBase64) throws Exception {
        byte[] decodedIv = Base64.getDecoder().decode(ivBase64);
        byte[] decodedEncryptedData = Base64.getDecoder().decode(encryptedData);

        String key = envVariables.get("KEY"); // hoặc hardcoded nếu đang test
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(decodedIv);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(decodedEncryptedData);

        return new String(decryptedBytes, "UTF-8");
    }


}