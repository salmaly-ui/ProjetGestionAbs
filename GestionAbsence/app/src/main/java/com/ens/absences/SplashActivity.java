package com.ens.absences;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.absences.utils.SessionManager;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        // Attendre 2 secondes puis rediriger
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            SessionManager session = new SessionManager(this);
            Intent intent;

            if (session.isLoggedIn()) {
                // Déjà connecté → aller directement à MainActivity
                intent = new Intent(this, MainActivity.class);
            } else {
                // Pas connecté → Login
                intent = new Intent(this, LoginActivity.class);
            }

            startActivity(intent);
            finish();
        }, 2000); // 2 secondes
    }
}