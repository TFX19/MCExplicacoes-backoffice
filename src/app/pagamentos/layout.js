import AuthGuard from '@/components/layout/AuthGuard'
export default function SectionLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
