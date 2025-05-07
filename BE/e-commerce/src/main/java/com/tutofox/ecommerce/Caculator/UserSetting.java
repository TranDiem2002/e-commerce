package com.tutofox.ecommerce.Caculator;

import java.security.PublicKey;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserSetting {

    private static final List<String> ALL_FEATURES = Arrays.asList(
            "làm sạch da", "thoáng lỗ chân lông", "dưỡng ẩm", "làm dịu da",
            "ngăn ngừa mụn", "giảm khô sần", "chống lão hóa", "làm sáng da",
            "làm mờ thâm", "bảo vệ khỏi UV", "tẩy da chết"
    );

    private static final List<String> ALL_INGREDIENTS = Arrays.asList(
            "rau má", "tơ tằm", "tràm trà", "sâm", "hoa hồng", "vitamin c",
            "quả bơ", "gạo", "cam gừng", "trà xanh", "than tre", "oải hương",
            "hương nhu", "bưởi", "mật ong", "cà phê"
    );

    private static final List<String> ALL_CATEGORIES = Arrays.asList(
            "tẩy trang", "rửa mặt", "toner", "xịt khoáng", "dưỡng da",
            "kem chống nắng", "son", "tẩy da chết", "xà bông", "sữa tắm", "dưỡng thể"
    );

    public Map<String,Double> getSkinOil(){
        Map<String, Double> oil = new HashMap<>();
        oil.put("làm sạch da", 0.9);
        oil.put("thoáng lỗ chân lông", 0.9);
        oil.put("ngăn ngừa mụn", 0.8);
        oil.put("kiểm soát dầu", 0.9);
        oil.put("dưỡng ẩm", 0.4);
        oil.put("tẩy da chết", 0.7);

        oil.put("tràm trà", 0.9);
        oil.put("than tre", 0.8);
        oil.put("vitamin C", 0.7);
        oil.put("rau má", 0.6);

        oil.put("rửa mặt", 0.9);
        oil.put("toner", 0.8);
        return oil;
    }

    public Map<String,Double> getSkinDry(){
        Map<String, Double> dry = new HashMap<>();
        dry.put("dưỡng ẩm", 1.0);
        dry.put("làm dịu da", 0.8);
        dry.put("giảm khô sần", 0.9);
        dry.put("làm sáng da", 0.6);
        dry.put("tẩy da chết", 0.3);
        dry.put("bảo vệ khỏi UV", 0.8);

        dry.put("quả bơ", 0.9);
        dry.put("mật ong", 0.9);
        dry.put("tơ tằm", 0.8);
        dry.put("gạo", 0.7);
        dry.put("vitamin C", -0.2);
        dry.put("than tre", -0.6);

        dry.put("dưỡng da", 1.0);
        dry.put("xịt khoáng", 0.9);
        dry.put("kem dưỡng", 1.0);
        return dry;
    }

    public Map<String,Double> getSkinSensitive(){
        Map<String, Double> sensitive = new HashMap<>();
        sensitive.put("làm dịu da", 1.0);
        sensitive.put("dưỡng ẩm", 0.9);
        sensitive.put("bảo vệ khỏi UV", 0.8);
        sensitive.put("tẩy da chết", 0.2);
        sensitive.put("làm sạch da", 0.6);

        sensitive.put("rau má", 0.9);
        sensitive.put("hoa hồng", 0.7);
        sensitive.put("oải hương", 0.8);
        sensitive.put("mật ong", 0.8);
        sensitive.put("tràm trà", -0.5);
        sensitive.put("vitamin C", -0.3);

        sensitive.put("xịt khoáng", 0.9);
        sensitive.put("dưỡng da", 0.9);
        sensitive.put("kem chống nắng", 0.8);
        return sensitive;
    }

    public Map<String,Double> getSkinNormal(){
        Map<String, Double> normal  = new HashMap<>();
        normal.put("dưỡng ẩm", 0.7);
        normal.put("làm sạch da", 0.7);
        normal.put("bảo vệ khỏi UV", 0.8);
        normal.put("tẩy da chết", 0.6);
        normal.put("chống lão hóa", 0.6);

        normal.put("trà xanh", 0.8);
        normal.put("vitamin C", 0.7);
        normal.put("hoa hồng", 0.7);
        normal.put("gạo", 0.6);
        return normal;
    }

    public Map<String, Double> getSkinCombination(){
        Map<String, Double> combination  = new HashMap<>();
        combination.put("dưỡng ẩm", 0.8);
        combination.put("làm sạch da", 0.7);
        combination.put("thoáng lỗ chân lông", 0.7);
        combination.put("tẩy da chết", 0.5);

        combination.put("nha đam", 0.8);
        combination.put("trà xanh", 0.8);
        combination.put("tơ tằm", 0.7);
        combination.put("tràm trà", 0.5);
        return combination;
    }

    //mụn
    public Map<String, Double> getSkinAcne(){
        Map<String, Double> acne = new HashMap<>();
        acne.put("ngăn ngừa mụn", 1.0);
        acne.put("làm sạch da", 0.9);
        acne.put("thoáng lỗ chân lông", 0.9);
        acne.put("làm mờ thâm", 0.8);
        acne.put("giảm viêm", 0.8);

        acne.put("rau má", 0.8);
        acne.put("vitamin C", 0.7);
        acne.put("bưởi", 0.6);
        acne.put("cà phê", 0.5);
        return acne;
    }

    //lỗ chân lông to
    public Map<String, Double> getSkinEnlargedPores(){
        Map<String, Double> enlargedPores = new HashMap<>();
        enlargedPores.put("thoáng lỗ chân lông", 1.0);
        enlargedPores.put("làm săn chắc da", 0.8);
        enlargedPores.put("kiểm soát dầu", 0.9);
        enlargedPores.put("tẩy da chết", 0.8);

        enlargedPores.put("than tre", 0.9);
        enlargedPores.put("tràm trà", 0.8);
        enlargedPores.put("bưởi", 0.8);
        return enlargedPores;
    }

    public Map<String, Double> getSkinMelasmaFeature(){
        Map<String, Double> melasma = new HashMap<>();
        melasma.put("làm sáng da", 1.0);
        melasma.put("làm mờ thâm", 1.0);
        melasma.put("bảo vệ khỏi tia UV", 1.0);
        melasma.put("chống oxy hóa", 0.9);
        melasma.put("tẩy da chết", 0.6);
        return melasma;
    }

    public Map<String, Double> getSkinMalasmaIngredient(){
        Map<String, Double> melasma = new HashMap<>();
        melasma.put("vitamin C", 0.9);
        melasma.put("gạo", 0.8);
        melasma.put("bưởi", 0.8);
        melasma.put("cam gừng", 0.7);
        return melasma;
    }
}
