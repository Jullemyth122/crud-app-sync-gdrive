import type { User } from "../config/types";

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    editingId: number | null;
}

export function UserTable({ users, onEdit, onDelete, editingId }: UserTableProps) {
    if (users.length === 0) return <p>No users yet.</p>;

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>All Users</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5}>
                                <div className="empty-state">
                                    <div className="empty-icon">◫</div>
                                    <p>No records yet — add one above</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className={editingId === user.id ? 'editing-row' : ''}>
                                <td className="id-cell">{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn-icon edit" onClick={() => onEdit(user)}>
                                            Edit
                                        </button>
                                        <button className="btn-icon danger" onClick={() => onDelete(user.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}