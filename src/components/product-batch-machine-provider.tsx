"use client";

import productBatchOperationsMachine from "@/lib/machines/productBatchOperationsMachine";
import { createActorContext } from "@xstate/react";
import { ReactNode } from "react";

export const ProductBatchMachineContext = createActorContext(
  productBatchOperationsMachine,
);

export function ProductBatchMachineProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProductBatchMachineContext.Provider>
      {children}
    </ProductBatchMachineContext.Provider>
  );
}
