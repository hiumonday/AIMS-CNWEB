//package com.ecommerce.aims.user.models;
//
//import java.util.Collection;
//import java.util.HashSet;
//import java.util.Set;
//import lombok.Getter;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//
//@Getter
//public class UserPrincipal implements UserDetails {
//
//    private final Long id;
//    private final String username;
//    private final String password;
//    private final UserStatus status;
//    private final Set<SimpleGrantedAuthority> authorities;
//
//    public UserPrincipal(User user) {
//        this.id = user.getId();
//        this.username = user.getEmail();
//        this.password = user.getPassword();
//        this.status = user.getStatus();
//
//        // Collect both role-based and permission-based authorities
//        Set<SimpleGrantedAuthority> auths = new HashSet<>();
//
//        // Add role authorities (ROLE_ADMIN, ROLE_PRODUCT_MANAGER, etc.)
//        user.getRoles().stream()
//            .map(role -> new SimpleGrantedAuthority(role.getName().name()))
//            .forEach(auths::add);
//
//        // Add permission authorities (PERM_USER:READ, PERM_PRODUCT:WRITE, etc.)
//        user.getRoles().stream()
//            .flatMap(role -> role.getPermissions().stream())
//            .map(permission -> new SimpleGrantedAuthority(permission.toAuthority()))
//            .forEach(auths::add);
//
//        this.authorities = auths;
//    }
//
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return authorities;
//    }
//
//    @Override
//    public String getPassword() {
//        return password;
//    }
//
//    @Override
//    public String getUsername() {
//        return username;
//    }
//
//    @Override
//    public boolean isAccountNonExpired() {
//        return true;
//    }
//
//    @Override
//    public boolean isAccountNonLocked() {
//        return status != UserStatus.LOCKED;
//    }
//
//    @Override
//    public boolean isCredentialsNonExpired() {
//        return true;
//    }
//
//    @Override
//    public boolean isEnabled() {
//        return status == UserStatus.ACTIVE;
//    }
//}
