let quien = "gefydev";
Bun.serve({ port: 9000, fetch(req) {
  const u = new URL(req.url);
  if (u.pathname === "/quien") { quien = u.searchParams.get("u"); return new Response("ok"); }
  if (u.pathname === "/login/oauth/authorize")
    return Response.redirect(u.searchParams.get("redirect_uri") + "?code=c&state=" + encodeURIComponent(u.searchParams.get("state")), 302);
  if (u.pathname === "/login/oauth/access_token") return Response.json({ access_token: "t-" + quien, token_type: "bearer" });
  const login = (req.headers.get("authorization") ?? "").split("t-")[1] ?? "";
  if (u.pathname === "/user") return Response.json({ login, email: login + "@example.com" });
  if (u.pathname === "/user/emails") return Response.json([{ email: login + "@example.com", primary: true, verified: true }]);
  if (u.pathname === "/user/orgs" || u.pathname === "/user/teams") return Response.json([]);
  return Response.json({});
}});
