import { AddProductFormValues } from "@/app/dashboard/products/addProductDialog";
import { assign, fromPromise, setup } from "xstate";
import { getClientId } from "../utils";
import { invoke } from "@tauri-apps/api/core";

export type Product = {
  id: string;
  client_id: string;
  product_name: string;
  total_quantity: number;
  total_shipper_boxes: number;
  created_at: string;
  updated_at: string;
};

export type BatchDetails = {
  id: string;
  product_id: string;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  boxes: number;
  units_per_box: number;
  packs_per_box: number;
  package_configuration: string;
  total_packs: string;
  created_at: string;
  updated_at: string;
};

type CreateProductResponse = {
  product: Product;
};

export type FetchProductResponse = {
  data: Array<{
    batch_details: Array<BatchDetails>;
    product: Product;
  }>;
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

const fetchClientProductsLogic = fromPromise(async () => {
  const clientId = await getClientId();
  const response = await invoke("get_all_products_for_client", {
    clientId: clientId,
  });

  return response;
});

const productOperationsMachine = setup({
  types: {
    context: {} as {
      createProductFormData: AddProductFormValues | undefined;
      productData: FetchProductResponse | undefined;
      message: string | undefined;
      error: unknown;
    },
    events: {} as
      | { type: "typing"; data: AddProductFormValues }
      | { type: "creating" }
      | { type: "success" }
      | { type: "failure"; error: string },
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
  actors: { createProductLogic, fetchClientProductsLogic },
}).createMachine({
  id: "productOperation",
  initial: "idle",
  context: {
    createProductFormData: undefined,
    productData: undefined,
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
      invoke: {
        id: "fetchProducts",
        src: "fetchClientProductsLogic",
        onDone: {
          actions: assign({
            productData: ({ event }) =>
              event.output as unknown as FetchProductResponse,
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
      after: {
        100: {
          target: "idle",
        },
      },
    },
    failure: {
      type: "final",
    },
  },
});

export default productOperationsMachine;
