
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { api } from "../lib/api";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/api/v1/auth/login",
        {
          email,
          password,
        }
      );

      // Temporary learning-stage token storage.
      // Replace with secure session handling
      // before production deployment.
      sessionStorage.setItem(
        "access_token",
        response.data.access_token
      );

      router.push("/dashboard");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Login failed"
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
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 text-white">

        <h1 className="text-3xl font-bold mb-2">
          Welcome back
        </h1>

        <p className="text-slate-400 mb-6">
          Login to WorkSphere
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-lg bg-slate-800 p-3"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          New to WorkSphere?{" "}
          <a
            href="/register"
            className="text-blue-400"
          >
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
