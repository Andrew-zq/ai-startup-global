(function () {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) {
    console.warn("Supabase client is not configured.");
    return;
  }
  window.supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
