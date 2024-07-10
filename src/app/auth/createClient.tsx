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
import { KeyRound, UserRoundPlus } from "lucide-react";
import { useEffect } from "react";

export default function CreateClient() {
  const [clientState, sendClient] = useMachine(clientOperationsMachine);

  const { toast } = useToast();

  const handleCreateClient = () => {
    sendClient({ type: "CREATE" });
  };

  useEffect(() => {
    if (clientState.matches("failure") && clientState.context.error)
      toast({
        className: "bg-red-700",
        title: "Authentication Error",
        description: clientState.context.error as unknown as string,
      });

    if (clientState.matches("success") && clientState.context.clientData)
      toast({
        className: "bg-green-700",
        title: "Client Created",
        description: `Client ${clientState.context.clientData.client.id} key generation complete`,
      });
  }, [clientState.matches("failure"), clientState.matches("success")]);

  return (
    <Card className="w-[700px] min-h-[40vh] bg-black">
      <CardHeader className="p-10">
        <CardTitle className="flex">
          <UserRoundPlus className="mr-2" />
          Register Device
        </CardTitle>
        <CardDescription>Using assymetric key algorithm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mt-8">
          <small>client generated data handled securely.</small>
        </div>
        <div className="flex justify-center mb-10">
          <Button
            onClick={handleCreateClient}
            variant="outline"
            size="lg"
            className="px-20 py-8"
            disabled={!clientState.matches("idle")}
          >
            <KeyRound className="mr-2" />{" "}
            <span className="text-2xl">
              {clientState.matches("creating")
                ? `GENERATING KEYPAIR`
                : `GENERATE KEYPAIR`}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
