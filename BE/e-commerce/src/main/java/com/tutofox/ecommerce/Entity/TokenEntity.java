package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "token")
public class TokenEntity {

    @Id
    @GeneratedValue
    public Integer id;

    @Column(unique = true)
    public String token;

    @Enumerated(EnumType.STRING)
    public TokenType tokenType = TokenType.BEARER;

    public boolean revoked;

    public boolean expired;

    public Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    public UserEntity user;

    @Column(name = "timeLogin")
    private Date timeLogin;

    @Column(name = "logoutTime")
    public Date logoutTime;
}
