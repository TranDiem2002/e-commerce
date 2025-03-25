package com.tutofox.ecommerce.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "skinType")
public class SkinTypeEntity {

    @Id
    @GeneratedValue
    @Column(name = "skinTypeId")
    private int skinTypeId;

    @Column(name = "skinTypeName")
    private String skinTypeName;

}
