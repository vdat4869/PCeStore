package com.project.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, 
                          UserDetailsService userDetailsService,
                          CustomAuthenticationEntryPoint customAuthenticationEntryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
    }

    // Cấu hình Pipeline bảo vệ cho hệ thống
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF vì sử dụng token stateless
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(customAuthenticationEntryPoint) // Bắn lỗi 401 khi rớt phân quyền
            )
            .authorizeHttpRequests(authz -> authz
                // Cho phép tất cả thực hiện đăng nhập, đăng ký mà không yêu cầu token
                .requestMatchers("/api/auth/**").permitAll()
                // Cho phép xem sản phẩm, category dưới tư cách khách hoăc User
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**").permitAll()
                // Cho phép Swagger UI và API Docs công khai để kiểm thử
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Mọi Request còn lại cần xác thực
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                // Stateless: Không lưu trạng thái xác thực trên session server (dùng hoàn toàn cho JWT)
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            // Kích hoạt JWT filter ưu tiên trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Định nghĩa Bean Provider cung cấp nguồn UserDetail và PasswordEncoder
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Trình mã hoá Password do Spring Security hỗ trợ (Bcrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Đăng ký xác thực Manager để AuthService có thể gọi
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
