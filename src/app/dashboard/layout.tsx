import { cookies } from 'next/headers';
import { logout } from '../actions/auth';
import LayoutWrapper from './LayoutWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userName = cookieStore.get('user_name')?.value || 'Personel';
  const userRole = cookieStore.get('user_role')?.value || 'Staff';

  return (
    <LayoutWrapper userName={userName} userRole={userRole} logoutAction={logout}>
      {children}
    </LayoutWrapper>
  );
}
