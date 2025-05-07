package com.tutofox.ecommerce.Caculator;

import com.tutofox.ecommerce.Entity.UserEntity;
import lombok.Builder;

@Builder
public class UserSimilarity {
    private final UserEntity user;
    private final double similarity;

    public UserSimilarity(UserEntity user, double similarity) {
        this.user = user;
        this.similarity = similarity;
    }

    public UserEntity getUser() {
        return user;
    }

    public double getSimilarity() {
        return similarity;
    }
}
