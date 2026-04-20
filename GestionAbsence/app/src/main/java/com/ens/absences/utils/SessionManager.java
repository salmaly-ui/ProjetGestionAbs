
package com.ens.absences.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {

    private static final String PREF_NAME  = "ENSSession";
    private static final String KEY_TOKEN  = "token";
    private static final String KEY_ID     = "user_id";
    private static final String KEY_NOM    = "user_nom";
    private static final String KEY_EMAIL  = "user_email";
    private static final String KEY_ROLE   = "user_role";

    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        prefs  = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void saveSession(String token, int id, String nom, String email, String role) {
        editor.putString(KEY_TOKEN, token);
        editor.putInt(KEY_ID, id);
        editor.putString(KEY_NOM, nom);
        editor.putString(KEY_EMAIL, email);
        editor.putString(KEY_ROLE, role);
        editor.apply();
    }

    public String getToken()  { return prefs.getString(KEY_TOKEN, null); }
    public int    getUserId() { return prefs.getInt(KEY_ID, -1); }
    public String getNom()    { return prefs.getString(KEY_NOM, ""); }
    public String getEmail()  { return prefs.getString(KEY_EMAIL, ""); }
    public String getRole()   { return prefs.getString(KEY_ROLE, ""); }

    public boolean isLoggedIn() { return getToken() != null; }

    public void logout() { editor.clear().apply(); }
}