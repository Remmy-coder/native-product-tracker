import { setup, fromPromise, assign } from "xstate";
import { invoke } from "@tauri-apps/api/core";

type CreateClientResponse = {
  client: { id: string; private_key_path: string };
};

type AuthenticateClientResponse = {
  token: string;
  client_id: string;
  expires_at: string;
};

const createClientLogic = fromPromise(async () => {
  const response = await invoke<CreateClientResponse>("create_client");
  return response;
});

const authenticateClientLogic = fromPromise(async () => {
  const response = await invoke<AuthenticateClientResponse>(
    "authenticate_client",
  );
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
          actions: assign({
            authData: ({ event }) => event.output,
          }),
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
