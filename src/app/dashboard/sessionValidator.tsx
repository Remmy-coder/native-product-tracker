"use client";

import { sessionMachine } from "@/lib/machines/validateSessionMachine";
import { useMachine } from "@xstate/react";
import { useEffect } from "react";

export default function SessionValidator({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, send] = useMachine(sessionMachine);

  useEffect(() => {
    send({ type: "CHECK" });
  }, [send]);
  return <>{children}</>;
}
