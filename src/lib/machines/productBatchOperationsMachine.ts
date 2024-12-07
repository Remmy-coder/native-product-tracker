import { AddProductBatchFormValues } from "@/app/dashboard/products/addProductBatch";
import { assign, setup } from "xstate";

const productBatchOperationsMachine = setup({
  types: {
    context: {} as {
      productBatchFormModal: boolean;
      productBatchFormData: AddProductBatchFormValues | undefined;
    },
    events: {} as
      | { type: "creating" }
      | { type: "typing"; data: AddProductBatchFormValues }
      | { type: "opening-modal" }
      | { type: "closing-modal" }
      | { type: "removing-batch"; batchIndex: number },
  },
  actions: {
    openFormModal: assign({
      productBatchFormModal: true,
    }),
    closeFormModal: assign({
      productBatchFormModal: false,
    }),
    assignFormInputs: assign({
      productBatchFormData: ({ event }) =>
        event.type === "typing" ? event.data : undefined,
    }),
    removeBatchFromContext: assign({
      productBatchFormData: ({ context, event }) =>
        event.type === "removing-batch"
          ? {
              ...context.productBatchFormData,
              batch: context.productBatchFormData?.batch.filter(
                (_, index) => index !== event.batchIndex,
              ) ?? [],
            }
          : context.productBatchFormData,
    }),
  },
  actors: {},
}).createMachine({
  id: "productBatchOperation",
  initial: "idle",
  context: {
    productBatchFormModal: false,
    productBatchFormData: undefined,
  },
  states: {
    idle: {
      on: {
        creating: {
          target: "create",
        },
        "opening-modal": {
          actions: "openFormModal",
        },
        "closing-modal": {
          actions: "closeFormModal",
        },
        typing: {
          actions: "assignFormInputs",
        },
        "removing-batch": {
          actions: "removeBatchFromContext",
        },
      },
    },
    create: {},
    success: {},
    failure: {},
  },
});

export default productBatchOperationsMachine;
