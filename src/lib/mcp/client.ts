const MCP_SERVERS = {
  food: process.env.MCP_FOOD_URL ?? "https://mcp.swiggy.com/food",
  instamart: process.env.MCP_INSTAMART_URL ?? "https://mcp.swiggy.com/im",
  dineout: process.env.MCP_DINEOUT_URL ?? "https://mcp.swiggy.com/dineout",
} as const;

type McpServer = keyof typeof MCP_SERVERS;

export async function callMCPTool(
  server: McpServer,
  tool: string,
  params: unknown,
  authToken?: string
): Promise<unknown> {
  const url = `${MCP_SERVERS[server]}/tools/${tool}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ params }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`MCP ${server}/${tool} responded ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function safeMCPCall<T>(
  server: McpServer,
  tool: string,
  params: unknown,
  fallback: T,
  authToken?: string
): Promise<{ data: T; error?: string; degraded: boolean }> {
  try {
    const data = (await callMCPTool(server, tool, params, authToken)) as T;
    return { data, degraded: false };
  } catch (err) {
    const error = err instanceof Error ? err.message : "MCP unavailable";
    console.error(`[MCP:${server}/${tool}] ${error}`);
    return { data: fallback, error, degraded: true };
  }
}

export const DEEPLINKS = {
  food: (restaurantId: string) => `swiggy://restaurant/${restaurantId}`,
  instamart: (query: string) => `swiggy://instamart/search?q=${encodeURIComponent(query)}`,
  dineout: (restaurantId: string, date: string, time: string, party: number) =>
    `swiggy://dineout/book?rid=${restaurantId}&date=${date}&time=${time}&party=${party}`,
};

export const ERROR_MESSAGES = {
  food_unavailable: "Couldn't fetch restaurant details right now. Here's a direct Swiggy link.",
  instamart_unavailable:
    "Cake/flower ordering isn't available through the agent right now. I'll share the Swiggy Instamart link.",
  dineout_booking_failed:
    "Reservation couldn't be placed through the agent. Here's a deeplink to complete in the Dineout app.",
  dineout_unavailable:
    "Couldn't check restaurant availability. Try booking directly on Swiggy Dineout.",
  all_agents_failed:
    "Swiggy's services seem busy right now. Here are direct app links for each.",
};
