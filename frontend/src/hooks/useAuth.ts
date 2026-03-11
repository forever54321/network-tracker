"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authed = isAuthenticated();
    setAuthenticated(authed);
    setLoading(false);
    if (!authed) {
      router.push("/login");
    }
  }, [router]);

  return { authenticated, loading };
}
