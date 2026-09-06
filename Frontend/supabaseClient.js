import { createClient } from '@supabase/supabase-js'

// استدعاء الرابط والمفتاح من متغيرات البيئة في Vercel / Vite بأمان تام
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('تحذير: متغيرات البيئة الخاصة بـ Supabase غير مفقودة أو غير محملة!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
