import { Product } from "@/lib/machines/productOperationsMachine";
import { ColumnDef } from "@tanstack/react-table";

export type ViewProduct = Omit<Product, "client_id">;

export const columns: ColumnDef<ViewProduct>[] = [
  {
    accessorKey: "product_name",
    header: "Product Name",
  },
  {
    accessorKey: "total_quantity",
    header: "Quantity",
  },
  {
    accessorKey: "total_shipper_boxes",
    header: "Shippers Boxes",
  },
  {
    accessorKey: "created_at",
    header: "Creation Date",
  },
];
