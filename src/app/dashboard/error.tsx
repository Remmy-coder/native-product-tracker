"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <h1 className="text-3xl mb-4 text-red-900">
        Error: Something went wrong
      </h1>

      <Button
        className="bg-white text-black"
        size="lg"
        onClick={
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
