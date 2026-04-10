// Supabase Edge Function — invite-user
// Sends an invitation email via Supabase Auth and creates the user's
// profile + role rows so they appear in the User Management list.
//
// Deploy: supabase functions deploy invite-user
// Requires SUPABASE_SERVICE_ROLE_KEY set in Edge Function secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Verify the caller is an admin ──────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client using the caller's JWT — used to verify admin role via RLS
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: callerUser } } = await callerClient.auth.getUser();
    if (!callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roleRow } = await callerClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .maybeSingle();

    if (roleRow?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Parse request body ─────────────────────────────────────
    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return new Response(JSON.stringify({ error: 'name, email, and role are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validRoles = ['admin', 'co_admin', 'external'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `role must be one of: ${validRoles.join(', ')}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Service-role client — bypasses RLS for writes ──────────
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Send invite email
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { name },
    });

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newUserId = inviteData.user.id;

    // Create user_roles row
    await adminClient.from('user_roles').upsert({
      user_id: newUserId,
      role,
    });

    return new Response(JSON.stringify({ userId: newUserId }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
