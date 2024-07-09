import dynamic from "next/dynamic";
import Image from "next/image";

const AuthComponent = dynamic(() => import("./auth/index"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AuthComponent />
    </main>
  );
}
