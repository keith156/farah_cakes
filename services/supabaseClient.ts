
import { createClient } from '@supabase/supabase-js';

const URL = 'https://yhbqjgrqbzmcmxrpnqfy.supabase.co';
const KEY = 'sb_publishable_H6RXBzi-CGdyIrsgWvhhSA_nIVYemf3';

// Export a reliable client instance. 
// Note: createClient never returns null; it returns a client object even with invalid keys.
export const supabase = createClient(URL, KEY);

console.log("Farah Cakes: Supabase client initialized for", URL);
