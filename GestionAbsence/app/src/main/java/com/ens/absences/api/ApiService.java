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
import okhttp3.ResponseBody;
public interface ApiService {
    // ✅ Ajouter cette route
    @POST("auth/register")
    Call<ResponseBody> register(@Body Map<String, String> body);
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest body);

    @GET("absences/mes-absences")
    Call<List<Absence>> getMesAbsences();

    // ✅ Garder getAbsences pour admin/agent si besoin
    @GET("absences")
    Call<List<Absence>> getAbsences();

    @POST("absences")
    Call<Map<String, Object>> createAbsence(@Body Map<String, String> body);

    @GET("absences/{id}/logs")
    Call<List<StatusLog>> getLogs(@Path("id") int absenceId);


    // ✅ URL corrigée
    @Multipart
    @POST("absences/{absenceId}/document")
    Call<Map<String, Object>> uploadDocument(
            @Path("absenceId") int absenceId,
            @Part MultipartBody.Part justificatif
    );
}