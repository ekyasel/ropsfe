import { cookies } from 'next/headers';
import UsersHeader from './UsersHeader';
import UsersTable from './UsersTable';

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";
  let users = [];
  let error = null;

  try {
    const response = await fetch(`${apiUrl}/api/users`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      users = await response.json();
    } else {
      error = "Gagal mengambil data pengguna";
    }
  } catch {
    error = "Koneksi ke server API gagal";
  }

  return (
    <>
      <UsersHeader />

      {error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
          {error}
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </>
  );
}
