package com.ecommerce.identity.service;

import com.ecommerce.identity.dto.AuthResponse;
import com.ecommerce.identity.dto.LoginRequest;
import com.ecommerce.identity.dto.RegisterRequest;
import com.ecommerce.identity.entity.User;
import com.ecommerce.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ecommerce.identity.exception.BusinessException;
import com.ecommerce.identity.exception.ResourceNotFoundException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtService.getExpiration())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtService.getExpiration())
                .build();
    }

    public AuthResponse registerAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.ADMIN)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtService.getExpiration())
                .build();
    }
}