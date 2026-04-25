import AuthGuard from '@/components/layout/AuthGuard'

export default function DashboardLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
