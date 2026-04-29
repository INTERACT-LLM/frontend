import Header from "@/components/Header/Header";
import { UserProvider } from "@/context/UserContext";
import { LLMConfigProvider } from "@/context/LLMConfigContext";

export default function AppLayout({ children }) {
  return (
    <UserProvider> {/* make user state available across the app (header, pages, etc.) */}
      <LLMConfigProvider> {/* make LLM model selection available across the app */}
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </LLMConfigProvider>
    </UserProvider>
  );
}