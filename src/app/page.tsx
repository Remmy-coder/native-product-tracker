import dynamic from "next/dynamic";
import Image from "next/image";

const AuthComponent = dynamic(() => import("./auth/index"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <AuthComponent />
    </main>
  );
}
