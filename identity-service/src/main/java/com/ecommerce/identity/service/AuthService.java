package com.ecommerce.identity.service;

import com.ecommerce.identity.dto.*;
import com.ecommerce.identity.entity.User;
import com.ecommerce.identity.exception.BusinessException;
import com.ecommerce.identity.exception.ResourceNotFoundException;
import com.ecommerce.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

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
        return buildAuthResponse(user);
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
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String email = refreshTokenService.getEmailFromRefreshToken(
                request.getRefreshToken());

        if (email == null) {
            throw new BusinessException("Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newAccessToken = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );

        String newRefreshToken = refreshTokenService.generateRefreshToken(email);
        refreshTokenService.deleteRefreshToken(request.getRefreshToken());

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtService.getExpiration())
                .build();
    }

    public void logout(LogoutRequest request) {
        refreshTokenService.blacklistAccessToken(
                request.getAccessToken(),
                jwtService.getExpiration()
        );
        refreshTokenService.deleteRefreshToken(request.getRefreshToken());
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "userId", user.getId())
        );
        String refreshToken = refreshTokenService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtService.getExpiration())
                .build();
    }
}