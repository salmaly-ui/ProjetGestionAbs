package com.ens.absences;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.absences.api.ApiClient;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import okhttp3.ResponseBody;

public class RegisterActivity extends AppCompatActivity {

    private EditText    etNom, etEmail, etPassword, etConfirm;
    private Button      btnRegister;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etNom       = findViewById(R.id.etNom);
        etEmail     = findViewById(R.id.etEmail);
        etPassword  = findViewById(R.id.etPassword);
        etConfirm   = findViewById(R.id.etConfirm);
        btnRegister = findViewById(R.id.btnRegister);
        progressBar = findViewById(R.id.progressBar);

        btnRegister.setOnClickListener(v -> register());

        // Lien retour vers Login
        TextView tvLogin = findViewById(R.id.tvDejaCompte);
        tvLogin.setOnClickListener(v -> finish());
    }

    private void register() {
        String nom      = etNom.getText().toString().trim();
        String email    = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirm  = etConfirm.getText().toString().trim();

        // Validations
        if (nom.isEmpty() || email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Tous les champs sont obligatoires",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        if (!password.equals(confirm)) {
            Toast.makeText(this, "Les mots de passe ne correspondent pas",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        if (password.length() < 4) {
            Toast.makeText(this, "Mot de passe trop court (4 caractères min)",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnRegister.setEnabled(false);

        Map<String, String> body = new HashMap<>();
        body.put("nom",      nom);
        body.put("email",    email);
        body.put("password", password);
        body.put("role",     "etudiant"); // ← toujours étudiant depuis le mobile

        ApiClient.getService(this)
                .register(body)
                .enqueue(new Callback<ResponseBody>() {
                    @Override
                    public void onResponse(Call<ResponseBody> call,
                                           Response<ResponseBody> response) {
                        progressBar.setVisibility(View.GONE);
                        btnRegister.setEnabled(true);

                        if (response.isSuccessful()) {
                            Toast.makeText(RegisterActivity.this,
                                    "Compte cr&#233;&#233; ! Connectez-vous.",
                                    Toast.LENGTH_LONG).show();
                            finish(); // retour vers Login
                        } else {
                            String msg = "Erreur inscription";
                            try {
                                msg = response.errorBody().string();
                            } catch (Exception ignored) {}
                            Toast.makeText(RegisterActivity.this, msg,
                                    Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        btnRegister.setEnabled(true);
                        Toast.makeText(RegisterActivity.this,
                                "Erreur r&#233;seau : " + t.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                });
    }
}