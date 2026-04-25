import Header from "@/components/Header/Header";
import { UserProvider } from "@/context/UserContext";

export default function AppLayout({ children }) {
  return (
    <UserProvider> {/* make user state available across the app (header, pages, etc.) */}
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </UserProvider>
  );
}