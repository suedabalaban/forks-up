package com.example.forksup.filter;

import com.example.forksup.config.DevConfig;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private DevConfig devConfig;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            HttpSession session = request.getSession();
            List<GrantedAuthority> authorities = new ArrayList<>();

            if (devConfig.isDevAdminToken(token)) {
                DevConfig.DevAdminToken devToken = new DevConfig.DevAdminToken("admin-uid", "admin@forksup.dev");
                session.setAttribute("uid", devToken.getUid());
                session.setAttribute("isAdmin", true);

                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                authorities.add(new SimpleGrantedAuthority("ROLE_VERIFIED"));
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(devToken.getUid(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                try {
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                    session.setAttribute("uid", decodedToken.getUid());

                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    if (decodedToken.isEmailVerified()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_VERIFIED"));
                    }
                    
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(decodedToken.getUid(), null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (FirebaseAuthException e) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}