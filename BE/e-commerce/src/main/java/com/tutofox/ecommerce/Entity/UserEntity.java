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

    @Column(name = "phone")
    private String phone;

    @Column(name = "gender")
    private Gender gender;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne
    @JoinColumn(name = "imageId")
    private ImageEntity imageEntity;

    @ManyToMany
    @JoinTable(name = "user_concerns",joinColumns = @JoinColumn(name = "userId"), inverseJoinColumns = @JoinColumn(name = "concernId"))
    private List<SkinConcernEntity> skinConcerns;

    @ManyToMany
    @JoinTable(name = "user_skin", joinColumns = @JoinColumn(name = "userId"),inverseJoinColumns = @JoinColumn(name = "skinTypeId"))
    private List<SkinTypeEntity> skinTypeEntities;

    @OneToOne
    @JoinColumn(name = "cartId")
    private CartEntity cartEntity;

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

    public String getName(){
        return userName;
    }
}
