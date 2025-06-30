// frontend/src/app/submitExpense/layout.tsx
import AuthGuard from '@/components/authGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}