"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import clientOperationsMachine from "@/lib/machines/clientOperationsMachine";
import { useMachine } from "@xstate/react";
import {
  KeyRound,
  LockKeyholeOpen,
  UserRoundPlus,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MachineSnapshot, MetaObject, NonReducibleUnknown } from "xstate";

export default function AuthClientOperation(
  state: MachineSnapshot<
    {},
    {
      type: "SWITCH";
    },
    {},
    "create_client" | "authenticate_client",
    string,
    NonReducibleUnknown,
    MetaObject
  >,
) {
  const [clientState, sendClient] = useMachine(clientOperationsMachine);

  const { toast } = useToast();

  const router = useRouter();

  const handleCreateClient = () => {
    sendClient({ type: "CREATE" });
  };

  const handleAuthenticateClient = () => {
    sendClient({ type: "AUTHENTICATE" });
  };

  useEffect(() => {
    if (clientState.matches("failure") && clientState.context.error) {
      toast({
        className: "bg-red-700",
        title: "Authentication Error",
        description: clientState.context.error as unknown as string,
      });
    }

    if (clientState.matches("success") && clientState.context.clientData) {
      toast({
        className: "bg-green-700",
        title: "Client Created",
        description: `Client ${clientState.context.clientData.client.id} key generation complete`,
      });
    }

    if (clientState.matches("success") && clientState.context.authData) {
      router.push("/dashboard");
      toast({
        className: "bg-green-700",
        title: "Session Created",
        description: `Session with token: ${clientState.context.authData.token} created`,
      });
    }
  }, [clientState.matches("failure"), clientState.matches("success")]);

  return (
    <Card className="w-[700px] min-h-[40vh] bg-black">
      <CardHeader className="p-10">
        <CardTitle className="flex">
          {state.matches("create_client") ? (
            <UserRoundPlus className="mr-2" />
          ) : state.matches("authenticate_client") ? (
            <ShieldCheck className="mr-2" />
          ) : null}
          {state.matches("create_client")
            ? `Register Device`
            : state.matches("authenticate_client")
              ? `Authenticate Client`
              : null}
        </CardTitle>
        <CardDescription>
          {state.matches("create_client")
            ? `Using assymetric key algorithm`
            : state.matches("authenticate_client")
              ? `Authenticate and generate a session`
              : null}{" "}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mt-8">
          <small>
            {state.matches("create_client")
              ? `client generated data handled securely.`
              : state.matches("authenticate_client")
                ? `scan and authenticate keypair.`
                : null}
          </small>
        </div>
        <div className="flex justify-center mb-10">
          <Button
            onClick={() => {
              state.matches("create_client")
                ? handleCreateClient()
                : state.matches("authenticate_client")
                  ? handleAuthenticateClient()
                  : null;
            }}
            variant="outline"
            size="lg"
            className="px-20 py-8"
            disabled={!clientState.matches("idle")}
          >
            {state.matches("create_client") ? (
              <KeyRound className="mr-2" />
            ) : state.matches("authenticate_client") ? (
              <LockKeyholeOpen className="mr-2" />
            ) : null}
            <span className="text-2xl">
              {state.matches("create_client")
                ? `GENERATE KEYPAIR`
                : state.matches("authenticate_client")
                  ? `AUTHENTICATE KEYPAIR`
                  : null}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
