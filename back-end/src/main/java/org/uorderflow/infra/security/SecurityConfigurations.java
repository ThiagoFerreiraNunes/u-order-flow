package org.uorderflow.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity){
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> {
                    // Auth
                    authorize.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll();
                    authorize.requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("ADMIN");

                    // Users
                    authorize.requestMatchers("/api/users/**").hasRole("ADMIN");

                    // Product Categories
                    authorize.requestMatchers("/api/product-categories/**").hasRole("ADMIN");

                    // Products
                    authorize.requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("ADMIN", "WAITER", "COOK");
                    authorize.requestMatchers("/api/products/**").hasRole("ADMIN");

                    // Restaurant Tables
                    authorize.requestMatchers(HttpMethod.GET, "/api/restaurant-tables/**").hasAnyRole("ADMIN", "WAITER", "COOK");
                    authorize.requestMatchers("/api/restaurant-tables/**").hasRole("ADMIN");

                    // Bills
                    authorize.requestMatchers(HttpMethod.GET, "/api/bills/**").hasAnyRole("ADMIN", "WAITER", "COOK");
                    authorize.requestMatchers("/api/bills/**").hasAnyRole("ADMIN", "WAITER");

                    // Orders
                    authorize.requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyRole("ADMIN", "WAITER", "COOK");
                    authorize.requestMatchers(HttpMethod.PATCH, "/api/orders/*/prepare").hasAnyRole("ADMIN", "WAITER", "COOK");
                    authorize.requestMatchers("/api/orders/**").hasAnyRole("ADMIN", "WAITER");

                    authorize.anyRequest().authenticated();

                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration){
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
