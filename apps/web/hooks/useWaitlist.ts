"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "trrim_waitlisted";

type Source = "DASHBOARD" | "LANDING";

type Options = {
  source?: Source;
  defaultEmail?: string;
};

export function useWaitlist({ source = "LANDING", defaultEmail = "" }: Options = {}) {
  const [email, setEmail] = useState(defaultEmail);
  const [notifyMe, setNotifyMe] = useState(true);
  const [foundingMember, setFoundingMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // Restore joined state: check localStorage first, then verify with API if email is known
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setJoined(true);
      return;
    }
    if (!defaultEmail) return;

    fetch(`/api/waitlist?email=${encodeURIComponent(defaultEmail)}`)
      .then((r) => r.json())
      .then((json: { data: { joined: boolean } | null; error: string | null }) => {
        if (json.data?.joined) {
          localStorage.setItem(STORAGE_KEY, "true");
          setJoined(true);
        }
      })
      .catch(() => {
        // non-critical — silently ignore
      });
  }, [defaultEmail]);

  const submit = async () => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      toast.error("Email is required.");
      return false;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source,
          options: { notifyMe, foundingMember },
        }),
      });

      const json = (await res.json()) as {
        data: { success: boolean } | null;
        error: string | null;
      };

      if (!res.ok || !json.data?.success) {
        toast.error(json.error ?? "Something went wrong. Please try again.");
        return false;
      }

      localStorage.setItem(STORAGE_KEY, "true");
      setJoined(true);
      return true;
    } catch {
      toast.error("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    notifyMe,
    setNotifyMe,
    foundingMember,
    setFoundingMember,
    loading,
    joined,
    submit,
  };
}
