package com.example.aitraining.config;

import com.example.aitraining.repo.UserRepository;
import com.example.aitraining.realtime.JobStreamWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.UUID;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final JobStreamWebSocketHandler jobStreamHandler;
    private final UserRepository users;

    public WebSocketConfig(JobStreamWebSocketHandler jobStreamHandler, UserRepository users) {
        this.jobStreamHandler = jobStreamHandler;
        this.users = users;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(jobStreamHandler, "/ws/jobs/{jobId}")
                .addInterceptors(new DevelopmentBearerHandshakeInterceptor(users))
                .setAllowedOrigins("*");
    }

    static final class DevelopmentBearerHandshakeInterceptor implements HandshakeInterceptor {
        private final UserRepository users;

        DevelopmentBearerHandshakeInterceptor(UserRepository users) {
            this.users = users;
        }

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            String token = bearerToken(request);
            if (token == null || users.findActiveByToken(token).isEmpty()) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }
            attributes.put("jobId", jobId(request));
            return true;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
        }

        private String bearerToken(ServerHttpRequest request) {
            String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (header != null && header.startsWith("Bearer ")) {
                return header.substring("Bearer ".length()).trim();
            }
            if (request instanceof ServletServerHttpRequest servletRequest) {
                return servletRequest.getServletRequest().getParameter("token");
            }
            return null;
        }

        private UUID jobId(ServerHttpRequest request) {
            String path = request.getURI().getPath();
            String raw = path.substring(path.lastIndexOf('/') + 1);
            return UUID.fromString(raw);
        }
    }
}
