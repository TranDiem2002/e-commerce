package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity(name = "user")
public class UserEntity implements UserDetails {

    @Id
    @Column(name = "userId")
    private int userId;

    @Column(name = "userName")
    private String userName;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "birthday")
    private Date birthday;

    @Column(name = "gender")
    private Gender gender;

    @Column(name = "skinType")
    private SkinType skinType;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne
    @JoinColumn(name = "imageId")
    private ImageEntity imageEntity;

    @ManyToMany
    @JoinTable(name = "user_concerns",joinColumns = @JoinColumn(name = "userId"), inverseJoinColumns = @JoinColumn(name = "concernId"))
    private List<SkinConcernEntity> skinConcerns;

    @OneToOne
    @JoinColumn(name = "cartId")
    private CartEntity cartEntity;

    @OneToOne
    @JoinColumn(name = "purchasedOrderId")
    private PurchasedOrderEntity purchasedOrderEntity;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.getRole().name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
