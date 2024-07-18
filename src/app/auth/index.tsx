"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment } from "react";
import clsx from "clsx";
import clientAuthTabMachine from "@/lib/machines/clientAuthTabMachine";
import { useMachine } from "@xstate/react";
import AuthClientOperation from "./authClientOperation";

export default function Auth() {
  const [state, send] = useMachine(clientAuthTabMachine);

  const handleSwitch = (
    targetState: "authenticate_client" | "create_client",
  ) => {
    if (state.value !== targetState) {
      send({ type: "SWITCH" });
    }
  };
  return (
    <Fragment>
      <main className="flex flex-col items-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl text-center font-semibold tracking-tight first:mt-0 mb-7">
          CLIENT AUTHENTICATION
        </h2>

        <Tabs defaultValue={state.value} className=" w-[750px]">
          <TabsList className="grid w-full grid-cols-2 bg-black">
            <TabsTrigger
              value="authenticate_client"
              className={clsx(
                "rounded-md focus:outline-none focus:ring focus:ring-gray-500",
                state.matches("authenticate_client") ? "bg-gray-500" : "",
              )}
              onClick={() => handleSwitch("authenticate_client")}
            >
              AUTHENTICATE CLIENT
            </TabsTrigger>
            <TabsTrigger
              value="create_client"
              className={clsx(
                "rounded-md focus:outline-none focus:ring focus:ring-gray-500",
                state.matches("create_client") ? "bg-gray-500" : "",
              )}
              onClick={() => handleSwitch("create_client")}
            >
              CREATE CLIENT
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="authenticate_client"
            className="flex flex-col items-center"
          >
            <AuthClientOperation {...state} />
          </TabsContent>
          <TabsContent
            value="create_client"
            className="flex flex-col items-center"
          >
            <AuthClientOperation {...state} />
          </TabsContent>
        </Tabs>
      </main>
    </Fragment>
  );
}
