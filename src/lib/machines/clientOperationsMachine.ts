import { setup, fromPromise, assign } from "xstate";
import { invoke } from "@tauri-apps/api/core";
import { StorageManager } from "../utils";

type CreateClientResponse = {
  client: { id: string; private_key_path: string };
};

export type AuthenticateClientResponse = {
  token: string;
  client_id: string;
  expires_at: string;
};

const storageManager = new StorageManager("store.bin");

const createClientLogic = fromPromise(async () => {
  const response = await invoke<CreateClientResponse>("create_client");
  return response;
});

const authenticateClientLogic = fromPromise(async () => {
  const response = await invoke<AuthenticateClientResponse>("sign_in");
  return response;
});

const clientOperationsMachine = setup({
  types: {
    context: {} as {
      clientData: CreateClientResponse | undefined;
      authData: AuthenticateClientResponse | undefined;
      error: unknown;
    },
  },
  actors: { createClientLogic, authenticateClientLogic },
}).createMachine({
  id: "clientOperations",
  initial: "idle",
  context: {
    clientData: undefined,
    authData: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        CREATE: "creating",
        AUTHENTICATE: "authenticating",
      },
    },
    creating: {
      invoke: {
        id: "createClient",
        src: "createClientLogic",
        onDone: {
          target: "success",
          actions: assign({
            clientData: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "failure",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    authenticating: {
      invoke: {
        id: "authenticateClient",
        src: "authenticateClientLogic",
        onDone: {
          target: "success",
          actions: [
            assign({
              authData: ({ event }) => event.output,
            }),
            async ({ context }) => {
              if (context.authData) {
                await storageManager.setItem(
                  "client_session",
                  context.authData,
                );
                await storageManager.save();
              }
            },
          ],
        },
        onError: {
          target: "failure",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    success: {
      on: {
        CREATE: "creating",
        AUTHENTICATE: "authenticating",
      },
    },
    failure: {
      on: {
        CREATE: "creating",
        AUTHENTICATE: "authenticating",
      },
    },
  },
});

export default clientOperationsMachine;
