
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { api } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import type { Organization } from "@/lib/types";


export default function CreateWorkspacePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<Organization>(
        "/api/v1/organizations/",
        { name },
        { headers: authHeaders() }
      );

      router.push(`/workspace/${response.data.id}`);

    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.detail ?? "Creation failed"
          : "Unable to create workspace"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-9 shadow-lg">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Create Workspace
        </h1>

        <p className="mt-2 text-slate-500">
          A workspace contains your team, projects, and tasks.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium"
            >
              Workspace Name
            </label>

            <input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TechNova"
              minLength={2}
              maxLength={150}
              required
              className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-600">
              {typeof error === "string" ? error : "Creation failed"}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </main>
  );
}
