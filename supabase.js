const { createClient } = require('@supabase/supabase-js');

// REMPLACEZ CES VALEURS PAR VOS IDENTIFIANTS SUPABASE
const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = {
  supabase,
  
  // Inscription
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  },

  // Connexion
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Récupérer l'utilisateur actuel
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Sauvegarder la dernière crypto utilisée
  async saveLastCrypto(symbol) {
    const user = await this.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, last_crypto: symbol, updated_at: new Date() });
    
    return { data, error };
  },

  // Récupérer la dernière crypto sauvegardée
  async getLastCrypto() {
    const user = await this.getUser();
    if (!user) return 'BINANCE:BTCUSDT'; // Valeur par défaut

    const { data, error } = await supabase
      .from('user_profiles')
      .select('last_crypto')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return 'BINANCE:BTCUSDT';
    return data.last_crypto;
  }
};
