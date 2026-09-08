package org.uorderflow.infra.security;

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

    private final SecurityFilter securityFilter;

    public SecurityConfigurations(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity){
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> {
                    // Auth
                    authorize.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll();
                    authorize.requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("ADMIN");

                    // ProductCategories
                    authorize.requestMatchers("/api/product-categories/**").hasRole("ADMIN");

                    // Products
                    authorize.requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("ADMIN", "WAITER", "CASHIER", "COOK");
                    authorize.requestMatchers("/api/products/**").hasRole("ADMIN");

                    // RestaurantTables
                    authorize.requestMatchers(HttpMethod.GET, "/api/restaurant-tables/**").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers("/api/restaurant-tables/**").hasRole("ADMIN");

                    // Users
                    authorize.requestMatchers(HttpMethod.GET, "/api/users").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers(HttpMethod.GET, "/api/users/*").hasAnyRole("ADMIN", "WAITER", "CASHIER", "COOK");
                    authorize.requestMatchers("/api/users/**").hasRole("ADMIN");

                    // Bills
                    authorize.requestMatchers(HttpMethod.PATCH,
                            "/api/bills/*/cancel",
                            "/api/bills/*/close",
                            "/api/bills/*/pay").hasAnyRole("ADMIN", "CASHIER");
                    authorize.requestMatchers(HttpMethod.POST, "/api/bills", "/api/bills/*/orders").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers(HttpMethod.PUT, "/api/bills/*").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers(HttpMethod.GET, "/api/bills/**").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers("/api/bills/**").hasRole("ADMIN");

                    // Orders
                    authorize.requestMatchers(HttpMethod.PATCH, "/api/orders/*/prepare").hasAnyRole("ADMIN", "WAITER", "CASHIER", "COOK");
                    authorize.requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyRole("ADMIN", "WAITER", "CASHIER", "COOK");
                    authorize.requestMatchers(HttpMethod.PATCH,
                            "/api/orders/*/cancel",
                            "/api/orders/*/deliver").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers(HttpMethod.PUT, "/api/orders/*").hasAnyRole("ADMIN", "WAITER", "CASHIER");
                    authorize.requestMatchers("/api/orders/**").hasRole("ADMIN");

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
