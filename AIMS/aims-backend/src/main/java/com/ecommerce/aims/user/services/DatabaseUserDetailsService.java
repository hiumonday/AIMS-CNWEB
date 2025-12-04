package com.ecommerce.aims.user.services;

import com.ecommerce.aims.user.models.User;
import com.ecommerce.aims.user.models.UserPrincipal;
import com.ecommerce.aims.user.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseUserDetailsService(
            UserRepository userRepository,
            @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // DEV/transition: if password is not a BCrypt hash, encode it once
        String pwd = user.getPassword();
        if (pwd != null
            && !pwd.startsWith("$2a$")
            && !pwd.startsWith("$2b$")
            && !pwd.startsWith("$2y$")) {

            user.setPassword(passwordEncoder.encode(pwd));
            user = userRepository.save(user);
        }

        return new UserPrincipal(user);
    }
}
