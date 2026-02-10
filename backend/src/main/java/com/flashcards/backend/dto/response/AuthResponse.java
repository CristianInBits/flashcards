package com.flashcards.backend.dto.response;

public record AuthResponse(

     String token,
     String type,
     String username,
     String email

) { }
