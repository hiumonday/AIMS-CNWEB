//package com.ecommerce.aims.user.services;
//
//import com.ecommerce.aims.user.models.User;
//import com.ecommerce.aims.user.models.UserPrincipal;
//import com.ecommerce.aims.user.repository.UserRepository;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//public class DatabaseUserDetailsService implements UserDetailsService {
//
//    private final UserRepository userRepository;
//
//    public DatabaseUserDetailsService(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        User user = userRepository.findByEmail(username)
//            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//        return new UserPrincipal(user);
//    }
//}
