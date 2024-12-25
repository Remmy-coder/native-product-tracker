import { AddProductFormValues } from "@/app/dashboard/products/addProductDialog";
import { assign, fromPromise, setup } from "xstate";
import { getClientId } from "../utils";
import { invoke } from "@tauri-apps/api/core";
import { checkSession } from "./validateSessionMachine";
import { AddProductBatchFormValues } from "@/app/dashboard/products/addProductBatch";
import { z } from "zod";
import { extendedBatchSchema } from "@/util/validateAndCalculateBatchConfig";
import { ViewProduct } from "@/app/dashboard/products/columns";

export type Product = {
  id: string;
  client_id: string;
  product_name: string;
  total_quantity: number;
  total_shipper_boxes: number;
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


export type AddProductBatchFormValuesStrict = Omit<AddProductBatchFormValues, "batch"> & {
  productId: string;
  batch: Array<NoUndefinedField<z.infer<typeof extendedBatchSchema>>>;
};

type CreateBatchDetailsResponse = {
  batch_details: Array<BatchDetails>;
}

type NoUndefinedField<T> = {
  [P in keyof T]-?: T[P] extends (...args: any[]) => any
  ? T[P]
  : NoUndefinedField<NonNullable<T[P]>>; };



const createProductLogic = fromPromise<
  CreateProductResponse,
  AddProductFormValues
>(async ({ input }): Promise<CreateProductResponse> => {
  checkSession();
  const clientId = await getClientId();
  const response = await invoke<CreateProductResponse>("create_product", {
    clientId: clientId,
    ...input,
  });

  return response;
});

const fetchClientProductsLogic = fromPromise(async () => {
  checkSession();
  const clientId = await getClientId();
  const response = await invoke("get_all_products_for_client", {
    clientId: clientId,
  });

  return response;
});

const updateProductLogic = fromPromise<
  CreateProductResponse,
  AddProductFormValues
>(async ({ input }) => {
  checkSession();
  const clientId = await getClientId();
  const response = await invoke<CreateProductResponse>("update_product", {
    clientId: clientId,
    productId: input.productId,
    ...input,
  });
  return response;
});

const createProductBatchLogic = fromPromise<
  CreateBatchDetailsResponse,
  { productId: string; batch: NoUndefinedField<AddProductBatchFormValues["batch"]> }
>(async ({ input }): Promise<CreateBatchDetailsResponse> => {
  try {
    console.log("Creating product batch with input:", input);
    checkSession();
    if (!input.productId) {
      throw new Error("Product ID is required.");
    }

    const batchPayload = input.batch.map(item => ({
      batchNo: item.batchNo,
      mfgDate: item.mfgDate.toISOString().split("T")[0],
      expDate: item.expDate.toISOString().split("T")[0],
      boxes: item.boxes,
      unitsPerBox: item.unitsPerBox,
      unitsPerPack: item.unitsPerPack,
      packsPerBox: item.packsPerBox,
      packagesConfiguration: item.packagesConfiguration,
      totalPacks: item.totalPacks,
    }));


    const response = await invoke<CreateBatchDetailsResponse>("create_batch_details", {
      productId: input.productId,
      batch: batchPayload,
    });


    return response;
  } catch (error) {
    console.error("Error during batch creation:", error);
    throw error;
  }
});

const productOperationsMachine = setup({
  types: {
    context: {} as {
      createProductFormData: AddProductFormValues | undefined;
      productFormModal: boolean;
      productData: FetchProductResponse | undefined;
      isEditing: boolean;

      productId: string | undefined;
      productBatchFormModal: boolean;
      productBatchFormData: AddProductBatchFormValues | undefined;
      viewProductBatchData: ViewProduct | undefined;

      message: string | undefined;
      error: unknown;
    },
    events: {} as
      | { type: "typing"; data: AddProductFormValues }
      | { type: "creating" }
      | { type: "editing" }
      | { type: "success" }
      | { type: "opening-modal" }
      | { type: "closing-modal" }
      | { type: "set-is-editing" }

      | { type: "creating-batch" }
      | { type: "typing-batch"; data: AddProductBatchFormValues }
      | { type: "set-product-id"; id: string }
      | { type: "opening-modal-batch" }
      | { type: "closing-modal-batch" }
      | { type: "removing-batch"; batchIndex: number }
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
    openModal: assign({
      productFormModal: true,
    }),
    closeModal: assign({
      productFormModal: false,
      isEditing: false,
      createProductFormData: undefined,
    }),
    setIsEditing: assign({
      isEditing: true,
    }),
    openBatchFormModal: assign({
      productBatchFormModal: true,
    }),
    closeBatchFormModal: assign({
      productBatchFormModal: false,
    }),
    setProductId: assign({
      productId: ({ event }) => event.type === "set-product-id" ? event.id : undefined,
    }),
    assignBatchFormInputs: assign({
      productBatchFormData: ({ event }) =>
        event.type === "typing-batch" ? event.data : undefined,
    }),
    removeBatchFromContext: assign({
      productBatchFormData: ({ context, event }) =>
        event.type === "removing-batch" && context.productBatchFormData?.batch
          ? {
            ...context.productBatchFormData,
            batch: context.productBatchFormData.batch.filter(
              (_, batchIndex) => batchIndex !== event.batchIndex
            ),
          }
          : context.productBatchFormData,
    }),
  },
  actors: {
    createProductLogic,
    fetchClientProductsLogic,
    updateProductLogic,
    createProductBatchLogic
  },
}).createMachine({
  id: "productOperation",
  initial: "idle",
  context: {
    createProductFormData: undefined,
    productFormModal: false,
    isEditing: false,
    productData: undefined,

    productId: undefined,
    productBatchFormModal: false,
    productBatchFormData: undefined,
    viewProductBatchData: undefined,
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
        editing: {
          target: "Edit",
        },
        "opening-modal": {
          actions: "openModal",
        },
        "closing-modal": {
          actions: "closeModal",
        },
        "set-is-editing": {
          actions: "setIsEditing",
        },
        "creating-batch": {
          target: "Create-batch",
        },
        "opening-modal-batch": {
          actions: "openBatchFormModal",
        },
        "closing-modal-batch": {
          actions: "closeBatchFormModal",
        },
        "typing-batch": {
          actions: "assignBatchFormInputs",
        },
        "set-product-id": {
          actions: "setProductId",
        },
        "removing-batch": {
          actions: "removeBatchFromContext",
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
          productName: createProductFormData?.productName.toLowerCase() || "",
          totalQuantity: createProductFormData?.totalQuantity || 0,
          totalShipperBoxes: createProductFormData?.totalShipperBoxes || 0,
        }),
        onDone: {
          target: "success",
          actions: assign({
            message: "Product created",
            createProductFormData: undefined,
            productFormModal: false,
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
    Edit: {
      invoke: {
        id: "updateProduct",
        src: "updateProductLogic",
        input: ({ context: { createProductFormData } }) => ({
          productId: createProductFormData?.productId || "",
          productName: createProductFormData?.productName.toLowerCase() || "",
          totalQuantity: createProductFormData?.totalQuantity || 0,
          totalShipperBoxes: createProductFormData?.totalShipperBoxes || 0,
        }),
        onDone: {
          target: "success",
          actions: assign({
            message: "Product modified",
            createProductFormData: undefined,
            isEditing: false,
            productFormModal: false,
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
    "Create-batch": {
      invoke: {
        id: "createProductBatch",
        src: "createProductBatchLogic",
        input: ({ context: { productBatchFormData, productId } }): AddProductBatchFormValuesStrict => {
          if (!productBatchFormData) {
            throw new Error("Product Batch is required.");
          }
          if (!productId) {
            throw new Error("Product ID is required.");
          }
          return {
            productId: productId,
            ...productBatchFormData,
            batch: productBatchFormData.batch.map((b) => ({
              ...b,
              packsPerBox: b.packsPerBox ?? 0,
              unitsPerBox: b.unitsPerBox ?? 0,
              totalPacks: b.totalPacks ?? 0,
            })),
          };
        },
        onDone: {
          target: "success",
          actions: assign({
            message: "Batch created",
            productBatchFormData: undefined,
            productBatchFormModal: false,
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
      on: {
        typing: {
          actions: "assignFormInputs",
        },
        creating: {
          target: "Create",
        },
        editing: {
          target: "Edit",
        },
        "opening-modal": {
          actions: "openModal",
        },
        "closing-modal": {
          actions: "closeModal",
        },
        "set-is-editing": {
          actions: "setIsEditing",
        },
        "creating-batch": {
          target: "Create-batch",
        },
        "opening-modal-batch": {
          actions: "openBatchFormModal",
        },
        "closing-modal-batch": {
          actions: "closeBatchFormModal",
        },
        "typing-batch": {
          actions: "assignBatchFormInputs",
        },
        "set-product-id": {
          actions: "setProductId",
        },
        "removing-batch": {
          actions: "removeBatchFromContext",
        },
      },
    },
  },
});

export default productOperationsMachine;
