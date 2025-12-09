package com.ecommerce.aims.security;

import com.ecommerce.aims.security.handlers.CustomAccessDeniedHandler;
import com.ecommerce.aims.security.handlers.CustomAuthenticationEntryPoint;
import com.ecommerce.aims.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final UserDetailsService userDetailsService;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // Product browsing (public)
                .requestMatchers("GET", "/products/**").permitAll()
                .requestMatchers("GET", "/categories/**").permitAll()
                .requestMatchers("GET", "/search/**").permitAll()
                
                // Cart and checkout (public for anonymous customers)
                .requestMatchers("POST", "/cart/**").permitAll()
                .requestMatchers("POST", "/checkout/**").permitAll()
                .requestMatchers("POST", "/orders/create").permitAll()
                
                // Payment callbacks (public but should verify signatures in controller)
                .requestMatchers("/payment/callback/**").permitAll()
                
                // Admin-only endpoints
                .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                
                // Product management (Admin + Product Manager)
                .requestMatchers("POST", "/products/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                .requestMatchers("PUT", "/products/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                .requestMatchers("DELETE", "/products/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                
                // Stock adjustment (Admin + Product Manager)
                .requestMatchers("/stock/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                
                // Order review (Admin + Product Manager)
                .requestMatchers("/orders/pending/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                .requestMatchers("POST", "/orders/*/approve").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                .requestMatchers("POST", "/orders/*/reject").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173")); // Add your frontend URLs
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
