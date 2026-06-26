import { useEffect, useMemo, useState } from 'react'
import {
    getAdminUsers,
    updateAdminUserRole,
    type AdminUser,
    type UserRole,
} from '../api/admin/users'
import { BackToDashboardButton } from '../components/admin/AdminButtons'
import { useAuth } from '../context/AuthContext'

const roles: Array<UserRole | 'ALL'> = ['ALL', 'USER', 'SUPPORT', 'ADMIN']

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

function getResponseError(error: unknown) {
    if (error instanceof Error) return error.message
    return 'Something went wrong'
}

function RoleBadge({ role }: { role: UserRole }) {
    const classes =
        role === 'ADMIN'
            ? 'bg-rose-100 text-rose-700'
            : role === 'SUPPORT'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700'

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
            {role}
        </span>
    )
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSavingId, setIsSavingId] = useState<string | null>(null)
    const [pageError, setPageError] = useState<string | null>(null)
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
    const [emailSearch, setEmailSearch] = useState('')
    const [roleErrorByUserId, setRoleErrorByUserId] = useState<Record<string, string>>({})

    const { isAuthLoading } = useAuth()

    async function loadUsers() {
        try {
            setIsLoading(true)
            setPageError(null)

            const data = await getAdminUsers()
            setUsers(data)
        } catch (error) {
            setPageError(getResponseError(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole =
                roleFilter === 'ALL' ? true : user.role === roleFilter

            const matchesEmail = user.email
                .toLowerCase()
                .includes(emailSearch.trim().toLowerCase())

            return matchesRole && matchesEmail
        })
    }, [users, roleFilter, emailSearch])

    async function handleRoleChange(user: AdminUser, role: UserRole) {
        if (user.role === role) return

        try {
            setIsSavingId(user.id)
            setRoleErrorByUserId((current) => ({
                ...current,
                [user.id]: '',
            }))

            const updatedUser = await updateAdminUserRole(user.id, { role })

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === updatedUser.id ? updatedUser : item,
                ),
            )
        } catch (error) {
            setRoleErrorByUserId((current) => ({
                ...current,
                [user.id]:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update user role',
            }))
        } finally {
            setIsSavingId(null)
        }
    }

    if (isLoading || isAuthLoading) {
        return (
            <main className="flex min-h-[50vh] items-center justify-center p-6">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading page...
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="space-y-6 p-4 sm:p-6">
            <BackToDashboardButton />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950">Users</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View accounts and manage user roles.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            {pageError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    ⚠️ {pageError}
                </div>
            )}

            <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-slate-700">
                        Find by email
                    </label>

                    <input
                        value={emailSearch}
                        onChange={(event) => setEmailSearch(event.target.value)}
                        placeholder="example@email.com"
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700">
                        Filter by role
                    </label>

                    <select
                        value={roleFilter}
                        onChange={(event) =>
                            setRoleFilter(event.target.value as UserRole | 'ALL')
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                    >
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role === 'ALL' ? 'All roles' : role}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
                    {filteredUsers.length} user
                    {filteredUsers.length === 1 ? '' : 's'} found
                </div>

                {/* Desktop */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">2FA</th>
                                <th className="px-4 py-3">Verified</th>
                                <th className="px-4 py-3">Orders</th>
                                <th className="px-4 py-3">Reviews</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3">Manage role</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-slate-950">
                                            {user.name ?? user.fullName ?? 'Unnamed user'}
                                        </div>

                                        <div className="text-slate-500">{user.email}</div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>

                                    <td className="px-4 py-4">
                                        {user.twoFactorConfirmedAt ? (
                                            <span className="text-emerald-700">Enabled</span>
                                        ) : (
                                            <span className="text-rose-700">Not enabled</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        {user.isVerified ? 'Yes' : 'No'}
                                    </td>

                                    <td className="px-4 py-4">
                                        {user._count.orders}
                                    </td>

                                    <td className="px-4 py-4">
                                        {user._count.reviews}
                                    </td>

                                    <td className="px-4 py-4">
                                        {formatDate(user.createdAt)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="space-y-2">
                                            <select
                                                value={user.role}
                                                disabled={isSavingId === user.id}
                                                onChange={(event) =>
                                                    handleRoleChange(
                                                        user,
                                                        event.target.value as UserRole,
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950 disabled:opacity-50"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="SUPPORT">SUPPORT</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>

                                            {roleErrorByUserId[user.id] && (
                                                <p className="max-w-xs text-xs font-medium text-rose-600">
                                                    {roleErrorByUserId[user.id]}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-slate-100 lg:hidden">
                    {filteredUsers.map((user) => (
                        <article key={user.id} className="space-y-4 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-950">
                                        {user.name ?? user.fullName ?? 'Unnamed user'}
                                    </h2>

                                    <p className="break-all text-sm text-slate-500">
                                        {user.email}
                                    </p>
                                </div>

                                <RoleBadge role={user.role} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">2FA</p>

                                    <p className="font-medium text-slate-950">
                                        {user.twoFactorConfirmedAt
                                            ? 'Enabled'
                                            : 'Not enabled'}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">Verified</p>

                                    <p className="font-medium text-slate-950">
                                        {user.isVerified ? 'Yes' : 'No'}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">Orders</p>

                                    <p className="font-medium text-slate-950">
                                        {user._count.orders}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-slate-500">Reviews</p>

                                    <p className="font-medium text-slate-950">
                                        {user._count.reviews}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Manage role
                                </label>

                                <div className="mt-1 space-y-2">
                                    <select
                                        value={user.role}
                                        disabled={isSavingId === user.id}
                                        onChange={(event) =>
                                            handleRoleChange(
                                                user,
                                                event.target.value as UserRole,
                                            )
                                        }
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950 disabled:opacity-50"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="SUPPORT">SUPPORT</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>

                                    {roleErrorByUserId[user.id] && (
                                        <p className="text-xs font-medium text-rose-600">
                                            {roleErrorByUserId[user.id]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}