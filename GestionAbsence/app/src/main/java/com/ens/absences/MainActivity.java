package com.ens.absences;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.ens.absences.adapters.AbsenceAdapter;
import com.ens.absences.api.ApiClient;
import com.ens.absences.models.Absence;
import com.ens.absences.utils.SessionManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private RecyclerView   recyclerView;
    private ProgressBar    progressBar;
    private TextView       tvVide;
    private AbsenceAdapter adapter;
    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        session      = new SessionManager(this);
        recyclerView = findViewById(R.id.recyclerView);
        progressBar  = findViewById(R.id.progressBar);
        tvVide       = findViewById(R.id.tvVide);

        TextView tvNom = findViewById(R.id.tvNomEtudiant);
        tvNom.setText("Bonjour, " + session.getNom());

        findViewById(R.id.btnLogout).setOnClickListener(v -> {
            session.logout();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        FloatingActionButton fab = findViewById(R.id.fabNouvelle);
        fab.setOnClickListener(v ->
                startActivity(new Intent(this, DeclarerAbsenceActivity.class))
        );

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
    }

    @Override
    protected void onResume() {
        super.onResume();
        chargerAbsences();
    }

    private void chargerAbsences() {
        progressBar.setVisibility(View.VISIBLE);
        tvVide.setVisibility(View.GONE);

        // ✅ getMesAbsences — filtrées par student_id côté backend
        ApiClient.getService(this)
                .getMesAbsences()
                .enqueue(new Callback<List<Absence>>() {
                    @Override
                    public void onResponse(Call<List<Absence>> call,
                                           Response<List<Absence>> response) {
                        progressBar.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null) {
                            List<Absence> absences = response.body();

                            if (absences.isEmpty()) {
                                tvVide.setVisibility(View.VISIBLE);
                            } else {
                                adapter = new AbsenceAdapter(absences, absence -> {
                                    Intent intent = new Intent(MainActivity.this,
                                            DetailAbsenceActivity.class);
                                    intent.putExtra("absence_id",      absence.id);
                                    intent.putExtra("absence_status",  absence.status);
                                    intent.putExtra("absence_start",   absence.startDate);
                                    intent.putExtra("absence_end",     absence.endDate);
                                    intent.putExtra("absence_reason",  absence.reason);
                                    intent.putExtra("absence_comment", absence.agentComment);
                                    startActivity(intent);
                                });
                                recyclerView.setAdapter(adapter);
                            }
                        } else {
                            Toast.makeText(MainActivity.this,
                                    "Erreur chargement (" + response.code() + ")",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Absence>> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(MainActivity.this,
                                "Erreur réseau : " + t.getMessage(),
                                Toast.LENGTH_SHORT).show();
                    }
                });
    }
}