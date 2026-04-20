package com.ens.absences;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.ens.absences.adapters.LogAdapter;
import com.ens.absences.api.ApiClient;
import com.ens.absences.models.StatusLog;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DetailAbsenceActivity extends AppCompatActivity {

    private TextView    tvStatut, tvDates, tvMotif, tvCommentaire;
    private RecyclerView recyclerLogs;
    private ProgressBar progressBar;
    private int absenceId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail_absence);

        // Récupérer les données passées depuis MainActivity
        absenceId = getIntent().getIntExtra("absence_id", -1);
        String status    = getIntent().getStringExtra("absence_status");
        String start     = getIntent().getStringExtra("absence_start");
        String end       = getIntent().getStringExtra("absence_end");
        String reason    = getIntent().getStringExtra("absence_reason");
        String comment   = getIntent().getStringExtra("absence_comment");

        tvStatut      = findViewById(R.id.tvStatut);
        tvDates       = findViewById(R.id.tvDates);
        tvMotif       = findViewById(R.id.tvMotif);
        tvCommentaire = findViewById(R.id.tvCommentaire);
        recyclerLogs  = findViewById(R.id.recyclerLogs);
        progressBar   = findViewById(R.id.progressBar);

        // Afficher les infos
        tvDates.setText("Du " + start + " au " + end);
        tvMotif.setText(reason != null && !reason.isEmpty() ? reason : "Aucun motif");

        // Badge statut coloré
        afficherStatut(status);

        // Commentaire de l'agent
        if (comment != null && !comment.isEmpty()) {
            tvCommentaire.setText("Commentaire : " + comment);
            tvCommentaire.setVisibility(View.VISIBLE);
        }

        // Bouton retour
        findViewById(R.id.btnRetour).setOnClickListener(v -> finish());

        // Charger l'historique
        recyclerLogs.setLayoutManager(new LinearLayoutManager(this));
        chargerHistorique();
    }

    private void afficherStatut(String status) {
        String label;
        int bgColor, textColor;

        switch (status != null ? status : "") {
            case "acceptee":
                label = "Acceptée";
                bgColor   = Color.parseColor("#ECFDF5");
                textColor = Color.parseColor("#065F46");
                break;
            case "refusee":
                label = "Refusée";
                bgColor   = Color.parseColor("#FEF2F2");
                textColor = Color.parseColor("#B91C1C");
                break;
            case "en_cours":
                label = "En vérification";
                bgColor   = Color.parseColor("#FFFBEB");
                textColor = Color.parseColor("#B45309");
                break;
            default:
                label = "Soumise";
                bgColor   = Color.parseColor("#EFF6FF");
                textColor = Color.parseColor("#1D4ED8");
                break;
        }

        tvStatut.setText(label);
        tvStatut.setBackgroundColor(bgColor);
        tvStatut.setTextColor(textColor);
    }

    private void chargerHistorique() {
        if (absenceId == -1) return;
        progressBar.setVisibility(View.VISIBLE);

        ApiClient.getService(this)
                .getLogs(absenceId)
                .enqueue(new Callback<List<StatusLog>>() {
                    @Override
                    public void onResponse(Call<List<StatusLog>> call, Response<List<StatusLog>> response) {
                        progressBar.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null) {
                            LogAdapter adapter = new LogAdapter(response.body());
                            recyclerLogs.setAdapter(adapter);
                        }
                    }

                    @Override
                    public void onFailure(Call<List<StatusLog>> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(DetailAbsenceActivity.this,
                                "Impossible de charger l'historique", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}