import { assign, createActor, fromPromise, setup } from "xstate";
import { StorageManager } from "../utils";
import { invoke } from "@tauri-apps/api/core";
import { AuthenticateClientResponse } from "./clientOperationsMachine";

const store = new StorageManager("store.bin");

const checkSessionLogic = fromPromise(async () => {
  const session = await store
    .getItem<AuthenticateClientResponse>("client_session")
    .catch((e: Error) => {
      console.log(e);
    });

  if (!session) throw new Error("No session");

  const response: boolean = await invoke<boolean>("validate_session", {
    session,
  });

  if (!response) {
    throw new Error("Session invalid");
  }

  return response;
});

const sessionMachine = setup({
  types: {
    context: {} as {
      error: unknown;
    },
    events: {} as
      | { type: "CHECK" }
      | { type: "done.invoke.checkSession"; data: boolean }
      | { type: "error.platform.checkSession"; data: unknown },
  },
  actors: { checkSessionLogic },
  actions: {
    handleSuccess: () => {
      // success handler
    },
    handleFailure: assign({
      error: (_, event: any) =>
        Error("Session validation failed. Redirecting..."),
    }),
    redirectToLogin: () => {
      window.location.href = "/";
    },
  },
}).createMachine({
  id: "session",
  initial: "checking",
  context: {
    error: undefined,
  },
  states: {
    checking: {
      invoke: {
        id: "checkSession",
        src: "checkSessionLogic",
        onDone: {
          target: "authenticated",
          actions: "handleSuccess",
        },
        onError: {
          target: "unauthenticated",
          actions: "handleFailure",
        },
      },
    },
    authenticated: {},
    unauthenticated: {
      // entry: "redirectToLogin",
    },
  },
});

export { sessionMachine };

export function checkSession() {
  const actor = createActor(sessionMachine);

  actor.start();

  actor.send({ type: "CHECK" });

  actor.subscribe((snapshot) => {
    // console.log(snapshot);
    if (snapshot.value === "unauthenticated") {
      window.location.href = "/";
    }
  });
}

// checkSession();
