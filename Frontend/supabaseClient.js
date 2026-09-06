import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// لو شغال بـ Vite أو bundler، بيقرا من import.meta.env
// لو شغال بملف HTML مباشر، هتحط المفاتيح هنا مباشرة بشكل مؤقت أو تمررها من الـ backend
const supabaseUrl = 'رابط_الـ_URL_الخاص بك'
const supabaseAnonKey = 'مفتاح_الـ_ANON_الخاص بك'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)