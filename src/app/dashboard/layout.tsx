import { ProductBatchMachineProvider } from "@/components/product-batch-machine-provider";
import { ProductMachineProvider } from "@/components/product-machine-provider";
import dynamic from "next/dynamic";

const HeaderComponent = dynamic(() => import("./header"), { ssr: false });
const SidebarComponent = dynamic(() => import("./sidebar"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarComponent />
      <div className="flex flex-col sm:gap-4 sm:pl-14">
        <HeaderComponent />
        <main>
          <ProductMachineProvider>
            <ProductBatchMachineProvider>
              {children}
            </ProductBatchMachineProvider>
          </ProductMachineProvider>
        </main>
      </div>
    </div>
  );
}
