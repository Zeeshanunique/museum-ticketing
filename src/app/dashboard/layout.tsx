import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard - Museum Ticketing',
  description: 'Admin dashboard for museum ticketing system',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 