package com.example.forksup.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal (
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    )
            throws ServletException, IOException
    {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = decodedToken.getUid();
                boolean emailVerified = decodedToken.isEmailVerified();

                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                if (emailVerified) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_VERIFIED"));
                }
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(uid, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (FirebaseAuthException e) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }
        filterChain.doFilter(request, response);
    }
}