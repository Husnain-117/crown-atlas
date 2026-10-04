import LayoutClientShell from "./layout-client-shell";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <LayoutClientShell>{children}</LayoutClientShell>;
}
