import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

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
