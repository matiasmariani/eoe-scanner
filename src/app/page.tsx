import { HomeClient } from '@/components/HomeClient';

export default function Home() {
  return (
    <main className="min-h-screen bg-theme-bg text-theme-text selection:bg-theme-primary selection:text-theme-bg">
      <HomeClient />
    </main>
  );
}
