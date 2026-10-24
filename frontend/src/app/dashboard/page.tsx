
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";


type User = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};


export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const token = sessionStorage.getItem(
      "access_token"
    );

    if (!token) {
      router.replace("/login");
      return;
    }

    api.get<User>("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        sessionStorage.removeItem("access_token");
        setError("Session expired. Please log in again.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [router]);


  function handleLogout() {
    sessionStorage.removeItem("access_token");
    router.replace("/login");
  }


  if (loading) {
    return (
      <main className="p-8">
        Loading your workspace...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <p role="alert">{error}</p>
        <button
          onClick={() => router.replace("/login")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go to login
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            WorkSphere Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 rounded-xl bg-slate-900 p-8">
          <h2 className="text-2xl font-semibold">
            Welcome, {user?.full_name}!
          </h2>

          <p className="mt-3 text-slate-400">
            Email: {user?.email}
          </p>

          <p className="mt-2 text-slate-400">
            User ID: {user?.id}
          </p>

          <p className="mt-6 text-blue-400">
            Your workspace is ready to be created.
          </p>
        </div>

      </div>
    </main>
  );
}
