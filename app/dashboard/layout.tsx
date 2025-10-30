import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
        <div></div>
        <DarkModeToggle />
      </header>
      <div>{children}</div>
    </>
  );
}
