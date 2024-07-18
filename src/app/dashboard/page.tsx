"use client";

import { StorageManager } from "@/lib/utils";
import { useEffect } from "react";
import { Home, Package, Package2, Settings, Truck } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Sidebar from "./sidebar";

export default function DashboardPage() {
  // useEffect(() => {
  //   const fetchAuthData = async () => {
  //     const storageManager = new StorageManager("store.bin");
  //     const data = await storageManager.getItem("client_session");
  //
  //     console.log(data);
  //   };
  //
  //   fetchAuthData();
  // }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <p>DashboardPage</p>
    </div>
  );
}
