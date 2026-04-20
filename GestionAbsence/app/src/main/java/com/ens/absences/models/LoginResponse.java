package com.ens.absences.models;

public class LoginResponse {

    public String token;
    public User   user;

    public static class User {
        public int    id;
        public String nom;
        public String email;
        public String role;
    }
}