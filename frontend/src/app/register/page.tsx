
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { api } from "@/lib/api";


export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post(
        "/api/v1/auth/register",
        form
      );

      router.push("/login");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Registration failed"
        );
      } else {
        setError("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 text-white shadow-xl">

        <h1 className="text-3xl font-bold mb-2">
          Create your account
        </h1>

        <p className="text-slate-400 mb-6">
          Join WorkSphere
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Full Name"
            required
            minLength={2}
            maxLength={150}
            value={form.full_name}
            onChange={(e) =>
              setForm({
                ...form,
                full_name: e.target.value,
              })
            }
            className="w-full rounded-lg bg-slate-800 p-3"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-lg bg-slate-800 p-3"
          />

          <input
            type="password"
            placeholder="Password (minimum 8 characters)"
            required
            minLength={8}
            maxLength={128}
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full rounded-lg bg-slate-800 p-3"
          />

          {error && (
            <p role="alert" className="text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-400"
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
