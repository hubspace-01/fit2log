import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to validate-telegram')
    
    const { initData } = await req.json()
    console.log('initData received:', initData ? 'yes' : 'no')

    if (!initData) {
      throw new Error('Missing initData')
    }

    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(TELEGRAM_BOT_TOKEN!)
      .digest()

    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      console.error('Hash mismatch!')
      throw new Error('Invalid hash')
    }

    const userParam = urlParams.get('user')
    if (!userParam) {
      throw new Error('No user data')
    }

    const user = JSON.parse(userParam)
    console.log('User validated:', user.id)

    // ✅ НОВОЕ: Создаем/обновляем профиль пользователя в таблице users
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          telegram_id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name || null,
          username: user.username || null,
          language_code: user.language_code || 'ru'
        }, { onConflict: 'telegram_id' })

      if (upsertError) {
        console.error('User upsert error:', upsertError)
      } else {
        console.log('User profile synced:', user.id)
      }
    } catch (err) {
      console.error('User sync error:', err)
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Validation error:', error.message)
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
