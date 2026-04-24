package com.ens.absences;

import androidx.annotation.NonNull;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.absences.api.ApiClient;
import com.ens.absences.models.LoginRequest;
import com.ens.absences.models.LoginResponse;
import com.ens.absences.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import android.widget.TextView;
public class LoginActivity extends AppCompatActivity {

    private EditText    etEmail, etPassword;
    private Button      btnLogin;
    private ProgressBar progressBar;
    private SessionManager session;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        session = new SessionManager(this);

        // Si déjà connecté → aller directement à MainActivity
        if (session.isLoggedIn()) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        etEmail     = findViewById(R.id.etEmail);
        etPassword  = findViewById(R.id.etPassword);
        btnLogin    = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);

        btnLogin.setOnClickListener(v -> login());
        // ✅ Lien vers Register
        TextView tvRegister = findViewById(R.id.tvRegister);
        tvRegister.setOnClickListener(v ->
                startActivity(new Intent(this, RegisterActivity.class))
        );
    }

    private void login() {
        String email    = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Email et mot de passe requis", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);

        ApiClient.getService(this)
                .login(new LoginRequest(email, password))
                .enqueue(new Callback<LoginResponse>() {
                    @Override
                    public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                        progressBar.setVisibility(View.GONE);
                        btnLogin.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null) {
                            LoginResponse data = response.body();

                            // Vérifier que c'est bien un étudiant
                            if (!"etudiant".equals(data.user.role)) {
                                Toast.makeText(LoginActivity.this,
                                        "Cette application est réservée aux étudiants",
                                        Toast.LENGTH_LONG).show();
                                return;
                            }

                            session.saveSession(
                                    data.token,
                                    data.user.id,
                                    data.user.nom,
                                    data.user.email,
                                    data.user.role
                            );

                            startActivity(new Intent(LoginActivity.this, MainActivity.class));
                            finish();
                        } else {
                            Toast.makeText(LoginActivity.this,
                                    "Email ou mot de passe incorrect",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<LoginResponse> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this,
                                "Erreur réseau : " + t.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                });
    }
}