"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "../lib/api";

type HealthResponse = {
  status: string;
  base_url?: string;
};

const api = createApiClient();

export default function SystemStatus() {
  const [status, setStatus] = useState<"ok" | "error" | "loading">("loading");
  const [details, setDetails] = useState<string>("checking...");

  useEffect(() => {
    async function loadHealth() {
      const response = await api.get<HealthResponse>("/health");

      // перевіряємо булеве поле ok, а не неіснуюче status
      if (response.ok && response.data?.status === "ok") {
        setStatus("ok");
        setDetails(response.data.base_url || "ready");
      } else {
        setStatus("error");
        setDetails(response.error || "unhealthy");
      }
    }

    void loadHealth();
  }, []);

  return (
    <div className="rounded-md border px-3 py-2 text-sm">
      <div className="font-medium">System status</div>
      <div className="mt-1">
        {status === "loading" && "Checking..."}
        {status === "ok" && `OK: ${details}`}
        {status === "error" && `Error: ${details}`}
      </div>
    </div>
  );
}

