package com.project.common.security;

import com.project.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;



@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.project.auth.service.JwtBlacklistService blacklistService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService,
                                   com.project.auth.service.JwtBlacklistService blacklistService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.blacklistService = blacklistService;
    }

    // Xử lý bộ lọc JWT cho mọi Request
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Nếu request không có Authorization Header hoặc không bắt đầu với "Bearer ", chuyển qua filter tiếp theo
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ qua chữ "Bearer " (7 ký tự)
        jwt = authHeader.substring(7);
        try {
            // Kiểm tra xem token có trong danh sách đen không
            if (blacklistService.isBlacklisted(jwt)) {
                throw new io.jsonwebtoken.JwtException("error.auth.token_blacklisted");
            }

            userEmail = jwtService.extractUsername(jwt);
            
            // Nếu context chưa có thông tin xác thực, xác nhận user & đẩy vào trong Context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Nếu Token lỗi (hết hạn, sai...), xóa context để coi là khách và tiếp tục luồng filter
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
