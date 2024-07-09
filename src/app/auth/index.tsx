"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fragment, useState } from "react";
import clsx from "clsx";
import { invoke } from "@tauri-apps/api/core";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<
    "sign_in_challenge" | "create_client"
  >("sign_in_challenge");

  // const handleTest = async () => {
  //   await invoke("create_client");
  // };
  //
  // const handleSignIn = async () => {
  //   try {
  //     const sessionData = await invoke("validate_session", { session });
  //     console.log(sessionData);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  return (
    <Fragment>
      <div>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl text-center font-semibold tracking-tight first:mt-0 mb-7">
          CLIENT AUTHENTICATION
        </h2>

        <Tabs defaultValue="sign_in_challenge" className=" w-[700px]">
          <TabsList className="grid w-full grid-cols-2 bg-black">
            <TabsTrigger
              value="sign_in_challenge"
              className={clsx(
                "rounded-md focus:outline-none focus:ring focus:ring-gray-500",
                activeTab === "sign_in_challenge" ? "bg-gray-500" : "",
              )}
              onClick={() => setActiveTab("sign_in_challenge")}
            >
              SIGN IN CHALLENGE
            </TabsTrigger>
            <TabsTrigger
              value="create_client"
              className={clsx(
                "rounded-md focus:outline-none focus:ring focus:ring-gray-500",
                activeTab === "create_client" ? "bg-gray-500" : "",
              )}
              onClick={() => setActiveTab("create_client")}
            >
              CLIENT CREATION
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign_in_challenge">
            <h4>Sign In Challenge</h4>
          </TabsContent>
          <TabsContent value="create_client">
            <h4>Create A Client</h4>
          </TabsContent>
        </Tabs>
      </div>
    </Fragment>
  );
}
