
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  ArrowRight,
  Layers3,
} from "lucide-react";

import { api } from "@/lib/api";
import {
  authHeaders,
  getCurrentUser,
  logout,
} from "@/lib/auth";
import type {
  Organization,
  User,
} from "@/lib/types";


export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<
    Organization[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser();

        const response = await api.get<Organization[]>(
          "/api/v1/organizations/",
          { headers: authHeaders() }
        );

        setUser(currentUser);
        setOrganizations(response.data);

      } catch {
        setError("Unable to load your workspaces.");

        if (!sessionStorage.getItem("access_token")) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);


  if (loading) {
    return <div className="p-10">Loading...</div>;
  }


  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers3 className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold">
              WorkSphere
            </h1>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2"
          >
            Logout
          </button>
        </header>

        <section className="mt-14">
          <h2 className="text-3xl font-bold">
            Welcome back, {user?.full_name}
          </h2>

          <p className="mt-2 text-slate-500">
            Select a workspace to continue.
          </p>
        </section>

        {error && (
          <p role="alert" className="mt-5 text-red-600">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Your Workspaces
          </h3>

          <Link
            href="/workspaces/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white"
          >
            <Plus size={18} />
            Create Workspace
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/workspace/${org.id}`}
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <Building2 className="text-blue-600" size={30} />

              <h4 className="mt-5 text-xl font-semibold">
                {org.name}
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Workspace
              </p>

              <div className="mt-6 flex items-center gap-2 text-blue-600">
                Open Workspace
                <ArrowRight size={17} />
              </div>
            </Link>
          ))}
        </div>

        {organizations.length === 0 && !error && (
          <div className="mt-10 rounded-xl border border-dashed bg-white p-10 text-center">
            <Building2 className="mx-auto text-slate-400" size={42} />

            <h3 className="mt-4 text-xl font-semibold">
              No workspaces yet
            </h3>

            <p className="mt-2 text-slate-500">
              Create your first workspace to start managing projects.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
