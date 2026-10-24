
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";

import { api } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import type { Organization, Project } from "@/lib/types";
import WorkspaceSidebar from "@/components/workspace-sidebar";


export default function WorkspacePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = use(params);
  const router = useRouter();

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  async function loadData() {
    try {
      const headers = authHeaders();

      const [orgResponse, projectResponse] =
        await Promise.all([
          api.get<Organization>(
            `/api/v1/organizations/${organizationId}`,
            { headers }
          ),
          api.get<Project[]>(
            `/api/v1/organizations/${organizationId}/projects/`,
            { headers }
          ),
        ]);

      setOrganization(orgResponse.data);
      setProjects(projectResponse.data);

    } catch {
      setError("Unable to load workspace.");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (!sessionStorage.getItem("access_token")) {
      router.replace("/login");
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, router]);


  async function createProject(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await api.post<Project>(
        `/api/v1/organizations/${organizationId}/projects/`,
        { name, description },
        { headers: authHeaders() }
      );

      setProjects((previous) => [
        response.data,
        ...previous,
      ]);

      setName("");
      setDescription("");

    } catch {
      setError("Could not create project.");
    } finally {
      setCreating(false);
    }
  }


  if (loading) return <p className="p-10">Loading workspace...</p>;

  if (!organization) {
    return (
      <main className="p-10">
        <p>{error || "Workspace not found."}</p>
        <Link href="/dashboard" className="text-blue-600">
          Back to dashboard
        </Link>
      </main>
    );
  }


  return (
    <div className="flex min-h-screen bg-slate-50">
      <WorkspaceSidebar organization={organization} />

      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">
            Workspace Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {organization.name}
          </h1>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <FolderKanban className="text-blue-600" />
              <p className="mt-4 text-sm text-slate-500">
                Total Projects
              </p>
              <p className="mt-2 text-3xl font-bold">
                {projects.length}
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Active Projects
              </p>
              <p className="mt-2 text-3xl font-bold">
                {projects.filter(p => p.status === "active").length}
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Workspace ID
              </p>
              <p className="mt-2 text-3xl font-bold">
                {organization.id}
              </p>
            </div>
          </div>

          <section id="projects" className="mt-12">
            <h2 className="text-2xl font-semibold">
              Projects
            </h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${organizationId}/projects/${project.id}`}
                  className="rounded-xl border bg-white p-6 transition hover:shadow-md"
                >
                  <FolderKanban className="text-blue-600" />

                  <h3 className="mt-4 text-lg font-semibold">
                    {project.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {project.description || "No description"}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm text-blue-600">
                    Open Project <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>

            {projects.length === 0 && (
              <p className="mt-6 text-slate-500">
                No projects yet. Create your first project below.
              </p>
            )}
          </section>

          <section className="mt-12 max-w-xl rounded-xl bg-white p-7 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Plus size={20} />
              Create Project
            </h2>

            <form onSubmit={createProject} className="mt-6 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                minLength={2}
                maxLength={150}
                required
                className="w-full rounded-lg border p-3"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description"
                rows={3}
                className="w-full rounded-lg border p-3"
              />

              {error && (
                <p role="alert" className="text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
