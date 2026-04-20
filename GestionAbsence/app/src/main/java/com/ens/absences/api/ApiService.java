package com.ens.absences.api;

import com.ens.absences.models.Absence;
import com.ens.absences.models.LoginRequest;
import com.ens.absences.models.LoginResponse;
import com.ens.absences.models.StatusLog;

import java.util.List;
import java.util.Map;

import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

public interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────────────
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest body);

    // ── Absences ──────────────────────────────────────────────────────────────

    // Consulter mes absences (filtrées automatiquement par le backend si etudiant)
    @GET("absences")
    Call<List<Absence>> getAbsences();

    // Déclarer une absence
    @POST("absences")
    Call<Map<String, Object>> createAbsence(@Body Map<String, String> body);

    // Historique des décisions d'une absence
    @GET("absences/{id}/logs")
    Call<List<StatusLog>> getLogs(@Path("id") int absenceId);

    // ── Documents ─────────────────────────────────────────────────────────────

    // Joindre un justificatif
    @Multipart
    @POST("documents/upload/{absenceId}")
    Call<Map<String, Object>> uploadDocument(
            @Path("absenceId") int absenceId,
            @Part MultipartBody.Part fichier
    );
}