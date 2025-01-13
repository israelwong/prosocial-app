// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseAnonKey || !supabaseAdmin) {
//     throw new Error('Missing Supabase URL, Anon Key, or Admin Key');
// }

// export const supabase = createClient(supabaseUrl, supabaseAdmin);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseAdminKey) {
    throw new Error('Missing Supabase URL or Admin Key');
}

const supabase = createClient(supabaseUrl, supabaseAdminKey);

export default supabase;
