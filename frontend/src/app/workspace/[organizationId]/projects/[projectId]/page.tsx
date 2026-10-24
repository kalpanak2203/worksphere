
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";

import { api } from "@/lib/api";
import { authHeaders } from "@/lib/auth";
import type {
  Organization,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";
import WorkspaceSidebar from "@/components/workspace-sidebar";


const columns: {
  status: TaskStatus;
  label: string;
}[] = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};


export default function ProjectBoardPage({
  params,
}: {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
}) {
  const { organizationId, projectId } = use(params);
  const router = useRouter();

  const baseUrl =
    `/api/v1/organizations/${organizationId}` +
    `/projects/${projectId}`;

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [movingTaskId, setMovingTaskId] =
    useState<number | null>(null);
  const [error, setError] = useState("");


  useEffect(() => {
    async function load() {
      try {
        const headers = authHeaders();

        const [orgRes, projectRes, taskRes] =
          await Promise.all([
            api.get<Organization>(
              `/api/v1/organizations/${organizationId}`,
              { headers }
            ),
            api.get<Project>(
              baseUrl,
              { headers }
            ),
            api.get<Task[]>(
              `${baseUrl}/tasks/`,
              { headers }
            ),
          ]);

        setOrganization(orgRes.data);
        setProject(projectRes.data);
        setTasks(taskRes.data);

      } catch {
        setError("Unable to load project board.");
      } finally {
        setLoading(false);
      }
    }

    if (!sessionStorage.getItem("access_token")) {
      router.replace("/login");
      return;
    }

    load();
  }, [organizationId, projectId, baseUrl, router]);


  async function createTask(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await api.post<Task>(
        `${baseUrl}/tasks/`,
        {
          title,
          description,
          priority,
        },
        { headers: authHeaders() }
      );

      setTasks((previous) => [
        response.data,
        ...previous,
      ]);

      setTitle("");
      setDescription("");
      setPriority("medium");

    } catch {
      setError("Unable to create task.");
    } finally {
      setCreating(false);
    }
  }


  async function moveTask(
    task: Task,
    newStatus: TaskStatus
  ) {
    setMovingTaskId(task.id);
    setError("");

    try {
      const response = await api.patch<Task>(
        `${baseUrl}/tasks/${task.id}`,
        { status: newStatus },
        { headers: authHeaders() }
      );

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? response.data : item
        )
      );

    } catch {
      setError("Unable to update task status.");
    } finally {
      setMovingTaskId(null);
    }
  }


  if (loading) {
    return <p className="p-10">Loading project...</p>;
  }

  if (!organization || !project) {
    return (
      <main className="p-10">
        <p>{error || "Project not found."}</p>
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
        <div className="mx-auto max-w-7xl">

          <Link
            href={`/workspace/${organizationId}`}
            className="flex items-center gap-2 text-sm text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Workspace
          </Link>

          <h1 className="mt-6 text-3xl font-bold">
            {project.name}
          </h1>

          <p className="mt-2 text-slate-500">
            {project.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {columns.map((column) => (
              <div
                key={column.status}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">
                  {column.label}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tasks.filter(
                    (task) => task.status === column.status
                  ).length}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" className="mt-5 text-red-600">
              {error}
            </p>
          )}

          <section className="mt-10 grid gap-5 lg:grid-cols-3">
            {columns.map((column, columnIndex) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.status
              );

              return (
                <div
                  key={column.status}
                  className="min-h-80 rounded-xl bg-slate-200/60 p-4"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-semibold">
                      {column.label}
                    </h2>

                    <span className="rounded-full bg-white px-3 py-1 text-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">
                            TASK-{task.id}
                          </span>

                          <span className={`rounded-full px-2 py-1 text-xs ${priorityClasses[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h3 className="mt-3 font-semibold">
                          {task.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          {task.description || "No description"}
                        </p>

                        <div className="mt-5 flex justify-between">
                          <button
                            disabled={
                              columnIndex === 0 ||
                              movingTaskId !== null
                            }
                            onClick={() =>
                              moveTask(
                                task,
                                columns[columnIndex - 1].status
                              )
                            }
                            className="rounded-lg border p-2 disabled:opacity-30"
                            aria-label="Move task backward"
                          >
                            <ArrowLeft size={17} />
                          </button>

                          <button
                            disabled={
                              columnIndex === columns.length - 1 ||
                              movingTaskId !== null
                            }
                            onClick={() =>
                              moveTask(
                                task,
                                columns[columnIndex + 1].status
                              )
                            }
                            className="rounded-lg border p-2 disabled:opacity-30"
                            aria-label="Move task forward"
                          >
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {columnTasks.length === 0 && (
                    <p className="mt-8 text-center text-sm text-slate-400">
                      No tasks
                    </p>
                  )}
                </div>
              );
            })}
          </section>

          <section className="mt-12 max-w-2xl rounded-xl bg-white p-7 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Plus size={20} />
              Create New Task
            </h2>

            <form onSubmit={createTask} className="mt-6 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
                maxLength={200}
                className="w-full rounded-lg border p-3"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className="w-full rounded-lg border p-3"
              />

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskPriority)
                }
                className="w-full rounded-lg border p-3"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
