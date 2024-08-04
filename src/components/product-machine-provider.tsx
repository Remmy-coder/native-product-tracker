"use client";

import productOperationsMachine from "@/lib/machines/productOperationsMachine";
import { createActorContext } from "@xstate/react";
import { ReactNode } from "react";

export const ProductMachineContext = createActorContext(
  productOperationsMachine,
);

export function ProductMachineProvider({ children }: { children: ReactNode }) {
  return (
    <ProductMachineContext.Provider>{children}</ProductMachineContext.Provider>
  );
}
