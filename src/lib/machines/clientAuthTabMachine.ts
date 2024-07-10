import { setup } from "xstate";

const clientAuthTabMachine = setup({
  types: {
    context: {} as {},
    events: {} as { type: "SWITCH" },
  },
}).createMachine({
  id: "clientAuthTab",
  initial: "authenticate_client",
  context: {},
  states: {
    authenticate_client: {
      on: {
        SWITCH: "create_client",
      },
    },
    create_client: {
      on: {
        SWITCH: "authenticate_client",
      },
    },
  },
});

export default clientAuthTabMachine;
