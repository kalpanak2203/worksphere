
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Layers3,
  Plus,
} from "lucide-react";

import { logout } from "../lib/auth";
import type { Organization } from "../lib/types";


type Props = {
  organization: Organization;
};


export default function WorkspaceSidebar({
  organization,
}: Props) {
  return (
    <aside className="w-64 min-h-screen shrink-0 bg-slate-950 text-white border-r border-slate-800 p-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-xl font-bold"
      >
        <Layers3 className="text-blue-400" />
        WorkSphere
      </Link>

      <div className="mt-10 rounded-xl bg-slate-900 p-4">
        <p className="text-xs text-slate-400">
          CURRENT WORKSPACE
        </p>

        <p className="mt-2 font-semibold">
          {organization.name}
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        <Link
          href={`/workspace/${organization.id}`}
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          <LayoutDashboard size={19} />
          Overview
        </Link>

        <Link
          href={`/workspace/${organization.id}#projects`}
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          <FolderKanban size={19} />
          Projects
        </Link>

        <Link
          href="/workspaces/new"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          <Plus size={19} />
          New Workspace
        </Link>
      </nav>

      <button
        onClick={logout}
        className="mt-12 flex items-center gap-3 text-red-400 hover:text-red-300"
      >
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
