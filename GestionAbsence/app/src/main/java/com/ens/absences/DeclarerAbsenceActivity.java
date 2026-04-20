package com.ens.absences;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.ens.absences.api.ApiClient;
import com.google.gson.Gson;

import java.io.InputStream;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DeclarerAbsenceActivity extends AppCompatActivity {

    private EditText etDateDebut, etDateFin, etMotif;
    private Button   btnDebut, btnFin, btnJustificatif, btnSoumettre;
    private TextView tvFichier;
    private ProgressBar progressBar;

    private String dateDebut = "", dateFin = "";
    private Uri    fichierUri = null;
    private int    absenceIdCree = -1;

    // Launcher pour choisir un fichier
    private final ActivityResultLauncher<String[]> pickFile =
            registerForActivityResult(new ActivityResultContracts.OpenDocument(), uri -> {
                if (uri != null) {
                    fichierUri = uri;
                    tvFichier.setText(getNomFichier(uri));
                    tvFichier.setVisibility(View.VISIBLE);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_declarer_absence);

        etDateDebut    = findViewById(R.id.etDateDebut);
        etDateFin      = findViewById(R.id.etDateFin);
        etMotif        = findViewById(R.id.etMotif);
        btnDebut       = findViewById(R.id.btnPickDebut);
        btnFin         = findViewById(R.id.btnPickFin);
        btnJustificatif = findViewById(R.id.btnJustificatif);
        btnSoumettre   = findViewById(R.id.btnSoumettre);
        tvFichier      = findViewById(R.id.tvFichierChoisi);
        progressBar    = findViewById(R.id.progressBar);

        // Sélecteur de date début
        btnDebut.setOnClickListener(v -> showDatePicker(true));
        btnFin.setOnClickListener(v   -> showDatePicker(false));

        // Choisir justificatif (PDF ou image)
        btnJustificatif.setOnClickListener(v ->
                pickFile.launch(new String[]{"image/*", "application/pdf"})
        );

        // Soumettre
        btnSoumettre.setOnClickListener(v -> soumettre());

        // Retour
        findViewById(R.id.btnRetour).setOnClickListener(v -> finish());
    }

    private void showDatePicker(boolean isDebut) {
        Calendar c = Calendar.getInstance();
        new DatePickerDialog(this, (view, year, month, day) -> {
            String date = String.format("%04d-%02d-%02d", year, month + 1, day);
            if (isDebut) {
                dateDebut = date;
                etDateDebut.setText(date);
            } else {
                dateFin = date;
                etDateFin.setText(date);
            }
        }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH)).show();
    }

    private void soumettre() {
        String motif = etMotif.getText().toString().trim();

        // Validations
        if (dateDebut.isEmpty() || dateFin.isEmpty()) {
            Toast.makeText(this, "Les dates sont obligatoires", Toast.LENGTH_SHORT).show();
            return;
        }
        if (dateDebut.compareTo(dateFin) > 0) {
            Toast.makeText(this, "La date de début doit être avant la date de fin", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnSoumettre.setEnabled(false);

        // Étape 1 : créer l'absence
        Map<String, String> body = new HashMap<>();
        body.put("start_date", dateDebut);
        body.put("end_date",   dateFin);
        body.put("reason",     motif);

        ApiClient.getService(this)
                .createAbsence(body)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            // Récupérer l'id de l'absence créée
                            Object idObj = response.body().get("id");
                            absenceIdCree = idObj != null ? ((Double) idObj).intValue() : -1;

                            // Étape 2 : uploader le justificatif si choisi
                            if (fichierUri != null && absenceIdCree != -1) {
                                uploadJustificatif(absenceIdCree);
                            } else {
                                progressBar.setVisibility(View.GONE);
                                Toast.makeText(DeclarerAbsenceActivity.this,
                                        "Absence soumise avec succès", Toast.LENGTH_LONG).show();
                                finish();
                            }
                        } else {
                            progressBar.setVisibility(View.GONE);
                            btnSoumettre.setEnabled(true);
                            Toast.makeText(DeclarerAbsenceActivity.this,
                                    "Erreur lors de la soumission", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        btnSoumettre.setEnabled(true);
                        Toast.makeText(DeclarerAbsenceActivity.this,
                                "Erreur réseau : " + t.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void uploadJustificatif(int absenceId) {
        try {
            InputStream is = getContentResolver().openInputStream(fichierUri);
            byte[] bytes = is.readAllBytes();
            is.close();

            String mimeType = getContentResolver().getType(fichierUri);
            if (mimeType == null) mimeType = "application/octet-stream";

            RequestBody requestBody = RequestBody.create(bytes, MediaType.parse(mimeType));
            MultipartBody.Part part = MultipartBody.Part.createFormData(
                    "justificatif", getNomFichier(fichierUri), requestBody
            );

            ApiClient.getService(this)
                    .uploadDocument(absenceId, part)
                    .enqueue(new Callback<Map<String, Object>>() {
                        @Override
                        public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                            progressBar.setVisibility(View.GONE);
                            Toast.makeText(DeclarerAbsenceActivity.this,
                                    "Absence et justificatif soumis avec succès", Toast.LENGTH_LONG).show();
                            finish();
                        }

                        @Override
                        public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                            progressBar.setVisibility(View.GONE);
                            Toast.makeText(DeclarerAbsenceActivity.this,
                                    "Absence créée mais upload échoué", Toast.LENGTH_LONG).show();
                            finish();
                        }
                    });

        } catch (Exception e) {
            progressBar.setVisibility(View.GONE);
            Toast.makeText(this, "Erreur lecture fichier", Toast.LENGTH_SHORT).show();
        }
    }

    private String getNomFichier(Uri uri) {
        String nom = "fichier";
        Cursor cursor = getContentResolver().query(uri, null, null, null, null);
        if (cursor != null && cursor.moveToFirst()) {
            int idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
            if (idx >= 0) nom = cursor.getString(idx);
            cursor.close();
        }
        return nom;
    }
}