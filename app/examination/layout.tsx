import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "../(Dashboard)/_components/Sidebar";
import { Navbar } from "../(Dashboard)/_components/Navbar";

export default async function ExaminationLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full">
      <div className="h-[60px] md:h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[60px] md:pt-[80px] h-full overflow-y-auto">
        <div className="mx-auto max-w-screen-xl p-4">
          {children}
        </div>
      </main>
    </div>
  );
} 