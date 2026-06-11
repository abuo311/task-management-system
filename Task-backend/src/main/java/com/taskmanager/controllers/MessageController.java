package com.taskmanager.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @GetMapping
    public ResponseEntity<?> getMessages() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}