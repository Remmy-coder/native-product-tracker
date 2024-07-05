import Image from "next/image";
import Greet from "./helloWorld";
import Auth from "./auth";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Auth />
    </main>
  );
}
