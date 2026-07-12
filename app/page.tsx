import { BackgroundGradient } from "@/components/layout/BackgroundGradient";
import { Header } from "@/components/layout/Header";
import { TestOrchestrator } from "@/components/speed-test/TestOrchestrator";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <BackgroundGradient />
      <Header />
      <div className="flex flex-1 items-center justify-center py-10">
        <TestOrchestrator />
      </div>
    </main>
  );
}
