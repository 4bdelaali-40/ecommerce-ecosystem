package com.ecommerce.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final WebClient webClient = WebClient.builder().build();

    private boolean checkService(String url) {
        try {
            webClient.get().uri(url)
                    .retrieve().bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(2))
                    .block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/services")
    public ResponseEntity<Map<String, Object>> checkAllServices() {
        Map<String, Object> statuses = new HashMap<>();
        statuses.put("api-gateway", true); // Si on est ici, gateway est UP
        statuses.put("identity", checkService("http://localhost:8085/actuator/health"));
        statuses.put("product", checkService("http://localhost:8081/actuator/health"));
        statuses.put("order", checkService("http://localhost:8082/actuator/health"));
        statuses.put("inventory", checkService("http://localhost:8083/actuator/health"));
        statuses.put("notification", checkService("http://localhost:8084/actuator/health"));
        statuses.put("ai", checkService("http://localhost:8086/actuator/health"));
        return ResponseEntity.ok(statuses);
    }
}