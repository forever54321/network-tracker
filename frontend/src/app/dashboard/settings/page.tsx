"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";
import { UserPlus, Server, Check, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/api/auth/register", { username, email, password, role });
      setMessage("User created successfully");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create user");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage users and view system info</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-gray-400" />
              <CardTitle>Create New User</CardTitle>
            </div>
          </CardHeader>

          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
              <Check className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-400" />
              <CardTitle>System Information</CardTitle>
            </div>
          </CardHeader>
          <dl className="space-y-3">
            {[
              ["Version", "1.0.0"],
              ["Data Retention (Raw Logs)", "30 days"],
              ["Data Retention (Sessions)", "1 year"],
              ["Data Retention (Aggregates)", "Indefinite"],
              ["Poll Interval", "30 seconds"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg py-1">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
