package org.uorderflow.infra.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Value("${uorderflow.cors.allowed-origins:http://localhost:3000,http://localhost:3030,http://127.0.0.1:3030}")
    private String corsAllowedOrigins = "http://localhost:3000,http://localhost:3030,http://127.0.0.1:3030";

    private final SecurityFilter securityFilter;

    public SecurityConfigurations(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        return httpSecurity
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers("/api/dashboard/**").hasRole("ADMIN");

                    // Auth
                    authorize.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/logout").permitAll();
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
                    authorize.requestMatchers(HttpMethod.PATCH, "/api/users/*/update-password").authenticated();
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
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Bill-Token", "Idempotency-Key"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
