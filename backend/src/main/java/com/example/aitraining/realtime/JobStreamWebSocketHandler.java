package com.example.aitraining.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JobStreamWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper mapper;
    private final Map<UUID, Map<String, WebSocketSession>> sessionsByJob = new ConcurrentHashMap<>();

    public JobStreamWebSocketHandler() {
        this.mapper = new ObjectMapper();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        UUID jobId = (UUID) session.getAttributes().get("jobId");
        sessionsByJob.computeIfAbsent(jobId, ignored -> new ConcurrentHashMap<>()).put(session.getId(), session);
        send(session, new JobStreamEnvelope("CONNECTED", jobId, Map.of("connected", true), Instant.now()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID jobId = (UUID) session.getAttributes().get("jobId");
        Map<String, WebSocketSession> sessions = sessionsByJob.get(jobId);
        if (sessions == null) {
            return;
        }
        sessions.remove(session.getId());
        if (sessions.isEmpty()) {
            sessionsByJob.remove(jobId);
        }
    }

    public void publish(UUID jobId, String type, Object payload) {
        Map<String, WebSocketSession> sessions = sessionsByJob.get(jobId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        JobStreamEnvelope envelope = new JobStreamEnvelope(type, jobId, payload, Instant.now());
        sessions.values().forEach(session -> {
            try {
                send(session, envelope);
            } catch (IOException ignored) {
                // The next close callback removes the stale session.
            }
        });
    }

    private void send(WebSocketSession session, JobStreamEnvelope envelope) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(mapper.writeValueAsString(envelope)));
        }
    }

    public record JobStreamEnvelope(String type, UUID jobId, Object payload, Instant occurredAt) {
    }
}
