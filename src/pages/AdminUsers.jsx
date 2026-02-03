import { useState, useEffect } from 'react';
import { admin } from '../api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.users().then((data) => setUsers(Array.isArray(data) ? data : [])).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const updateBalance = async (userId, balance) => {
    try {
      await admin.user(userId, 'PUT', { balance: Number(balance) });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, balance: Number(balance) } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="app-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page app-container">
      <h1>Manage Users</h1>
      <div className="admin-table card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Balance (INR)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                <td>
                  {u.role === 'customer' ? (
                    <input
                      type="number"
                      defaultValue={u.balance}
                      onBlur={(e) => updateBalance(u.id, e.target.value)}
                      style={{ width: 120 }}
                    />
                  ) : '-'}
                </td>
                <td>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
