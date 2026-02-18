import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

type OwnerStatusResponse = {
  is_active: boolean;
  planName: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Aceita POST (supabase.functions.invoke) e GET (debug)
    const url = new URL(req.url);
    const slugFromQuery = url.searchParams.get("slug");

    let slug: string | null = slugFromQuery;
    if (!slug && req.method !== "GET") {
      const body = await req.json().catch(() => null);
      slug = body?.slug ?? null;
    }

    if (!slug || typeof slug !== "string") {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[get-app-owner-status] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Resolve o dono do app pelo slug (somente apps publicados)
    const { data: app, error: appError } = await supabaseAdmin
      .from("apps")
      .select("user_id")
      .eq("slug", slug)
      .eq("status", "publicado")
      .maybeSingle();

    if (appError) {
      console.error("[get-app-owner-status] Error loading app", { slug, appError });
      return new Response(JSON.stringify({ error: "Error loading app" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!app?.user_id) {
      return new Response(JSON.stringify({ error: "App not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Busca status do usuário + nome do plano
    const { data: userStatus, error: statusError } = await supabaseAdmin
      .from("user_status")
      .select("is_active, plans(name)")
      .eq("user_id", app.user_id)
      .maybeSingle();

    if (statusError) {
      console.error("[get-app-owner-status] Error loading user_status", {
        user_id: app.user_id,
        statusError,
      });
      return new Response(JSON.stringify({ error: "Error loading owner status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isActive = userStatus?.is_active ?? true;
    const planName = (userStatus as any)?.plans?.name ?? "Gratuito";

    const payload: OwnerStatusResponse = {
      is_active: isActive,
      planName,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[get-app-owner-status] Unhandled error", message);

    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
