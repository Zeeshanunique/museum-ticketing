import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Admin - Museum Ticketing',
  description: 'Admin interface for managing museum data',
};

export default function AdminLayout({
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