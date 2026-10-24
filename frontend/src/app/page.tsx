"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-400">
          WorkSphere
        </p>
        <h1 className="mt-4 text-3xl font-bold">Loading your workspace...</h1>
      </div>
    </main>
  );
}
