import { AddProductFormValues } from "@/app/dashboard/products/addProductDialog";
import { assign, fromPromise, setup } from "xstate";
import { getClientId } from "../utils";
import { invoke } from "@tauri-apps/api/core";

type CreateProductResponse = {
  product: {
    id: string;
    client_id: string;
    product_name: string;
    total_quantity: number;
    total_shippers_boxes: number;
  };
};

const createProductLogic = fromPromise<
  CreateProductResponse,
  AddProductFormValues
>(async ({ input }): Promise<CreateProductResponse> => {
  const clientId = await getClientId();
  const response = await invoke<CreateProductResponse>("create_product", {
    clientId: clientId,
    ...input,
  });

  return response;
});

const productOperationsMachine = setup({
  types: {
    context: {} as {
      createProductFormData: AddProductFormValues | undefined;
      message: string | undefined;
      error: unknown;
    },
    events: {} as
      | { type: "typing"; data: AddProductFormValues }
      | { type: "creating" },
  },
  actions: {
    assignFormInputs: assign({
      createProductFormData: ({ event }) =>
        event.type === "typing" ? event.data : undefined,
    }),
    resetMessage: assign({
      message: undefined,
    }),
  },
  actors: { createProductLogic },
}).createMachine({
  id: "productOperation",
  initial: "idle",
  context: {
    createProductFormData: undefined,
    message: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        typing: {
          actions: "assignFormInputs",
        },
        creating: {
          target: "Create",
        },
      },
    },
    Create: {
      invoke: {
        id: "createProduct",
        src: "createProductLogic",
        input: ({ context: { createProductFormData } }) => ({
          productName: createProductFormData?.productName || "",
          totalQuantity: createProductFormData?.totalQuantity || 0,
          totalShipperBoxes: createProductFormData?.totalShipperBoxes || 0,
        }),
        onDone: {
          target: "success",
          actions: assign({
            message: "Product created",
            error: undefined,
          }),
        },
        onError: {
          target: "failure",
          actions: assign({
            error: ({ event }) => event.error,
            message: undefined,
          }),
        },
      },
    },
    success: {
      on: {
        typing: {
          actions: ["assignFormInputs", "resetMessage"],
          target: "idle",
        },
        creating: {
          target: "Create",
        },
      },
    },
    failure: {
      on: {
        typing: {
          actions: "assignFormInputs",
        },
        creating: {
          target: "Create",
        },
      },
    },
  },
});

export default productOperationsMachine;
