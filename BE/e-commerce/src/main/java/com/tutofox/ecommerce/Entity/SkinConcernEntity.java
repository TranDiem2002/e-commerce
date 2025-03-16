package com.tutofox.ecommerce.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity(name = "skin_concern")
public class SkinConcernEntity {

    @Id
    @Column(name = "concernId")
    private int concernId;

    @Column(name = "concernName")
    private String concernName;
}
