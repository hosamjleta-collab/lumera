import "server-only";

export async function sendAdminNotification(params: {
  title: string;
  message: string;
  clickUrl?: string;
}) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.log("[notify] NTFY_TOPIC not configured, skipping notification");
    return;
  }

  const serverUrl = process.env.NTFY_SERVER_URL || "https://ntfy.sh";
  const token = process.env.NTFY_TOKEN;

  const headers: Record<string, string> = {
    Title: params.title,
    Priority: "high",
    Tags: "shopping_cart",
  };

  if (params.clickUrl) {
    headers["Click"] = params.clickUrl;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${serverUrl}/${topic}`, {
      method: "POST",
      headers,
      body: params.message,
    });

    if (!res.ok) {
      console.error("[notify] Failed:", res.status, await res.text());
    } else {
      console.log("[notify] Admin notification sent");
    }
  } catch (error) {
    console.error("[notify] Error:", error);
  }
}
