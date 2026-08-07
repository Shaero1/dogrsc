'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createUser, listUsers, updateUser } from '@/lib/api';
import { getToken } from '@/lib/auth';
import {
  ADMIN_USER_ROLES,
  type AdminUserRecord,
  type AdminUserRole,
} from '@/lib/users-types';

export default function UsersPage() {
  const [items, setItems] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'ALL'>('ALL');
  const [actionId, setActionId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUserRole>('STAFF');
  const [creating, setCreating] = useState(false);

  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUserRole>>({});
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  async function load(filter: AdminUserRole | 'ALL') {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await listUsers(
        token,
        filter === 'ALL' ? undefined : { role: filter },
      );
      setItems(data.items);
      setRoleDrafts(
        Object.fromEntries(data.items.map((item) => [item.id, item.role])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(roleFilter);
  }, [roleFilter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    setCreating(true);
    setError(null);

    try {
      await createUser(token, {
        email: email.trim(),
        password,
        role,
      });
      setEmail('');
      setPassword('');
      setRole('STAFF');
      await load(roleFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleUpdate(item: AdminUserRecord) {
    const token = getToken();
    if (!token) return;

    const nextRole = roleDrafts[item.id];
    if (!nextRole || nextRole === item.role) {
      return;
    }

    setActionId(item.id);
    setError(null);

    try {
      await updateUser(token, item.id, { role: nextRole });
      await load(roleFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActionId(null);
    }
  }

  async function handlePasswordUpdate(item: AdminUserRecord) {
    const token = getToken();
    if (!token) return;

    const nextPassword = passwordDrafts[item.id]?.trim() ?? '';
    if (nextPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setActionId(item.id);
    setError(null);

    try {
      await updateUser(token, item.id, { password: nextPassword });
      setPasswordDrafts((current) => ({ ...current, [item.id]: '' }));
      await load(roleFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <AdminHeader title="Users & roles" />
      <div className="flex-1 p-6">
        <p className="mb-4 text-sm text-zinc-600">
          Manage admin panel accounts (ADMIN and STAFF). Public USER accounts are
          not listed here.
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-600" htmlFor="user-role-filter">
            Role
          </label>
          <select
            id="user-role-filter"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as AdminUserRole | 'ALL')
            }
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            {ADMIN_USER_ROLES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={(event) => void handleCreate(event)}
          className="mb-8 max-w-3xl space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
        >
          <h2 className="text-sm font-medium text-zinc-900">Add user</h2>
          <div className="flex flex-wrap gap-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="Email"
              className="min-w-[220px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={8}
              placeholder="Password (min 8)"
              className="min-w-[180px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminUserRole)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {ADMIN_USER_ROLES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
            >
              {creating ? 'Saving…' : 'Add'}
            </button>
          </div>
        </form>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}

        {!loading ? (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Reset password</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={roleDrafts[item.id] ?? item.role}
                          onChange={(event) =>
                            setRoleDrafts((current) => ({
                              ...current,
                              [item.id]: event.target.value as AdminUserRole,
                            }))
                          }
                          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                        >
                          {ADMIN_USER_ROLES.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={actionId === item.id}
                          onClick={() => void handleRoleUpdate(item)}
                          className="text-amber-800 hover:underline disabled:opacity-50"
                        >
                          Save role
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={passwordDrafts[item.id] ?? ''}
                          onChange={(event) =>
                            setPasswordDrafts((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          type="password"
                          minLength={8}
                          placeholder="New password"
                          className="min-w-[160px] rounded-md border border-zinc-300 px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          disabled={actionId === item.id}
                          onClick={() => void handlePasswordUpdate(item)}
                          className="text-amber-800 hover:underline disabled:opacity-50"
                        >
                          Save password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">No users found.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
