"use client";

import { ProductBatchMachineContext } from "@/components/product-batch-machine-provider";
import { ProductMachineContext } from "@/components/product-machine-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BatchDetails, Product } from "@/lib/machines/productOperationsMachine";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

type ProductBatch = {
  batch_details: Array<BatchDetails>;
};

export type ViewProduct = Omit<Product, "client_id"> & ProductBatch;

export const columns: ColumnDef<ViewProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => {
      const product_name: string = row.getValue("product_name");
      return <div className="capitalize">{product_name}</div>;
    },
  },
  {
    accessorKey: "total_quantity",
    header: () => <div className="text-base">Quantity</div>,
    cell: ({ row }) => {
      const total_quantity: number = row.getValue("total_quantity");
      return <div className="capitalize">{total_quantity}</div>;
    },
  },
  {
    accessorKey: "total_shipper_boxes",
    header: () => <div className="text-base">Shipper Boxes</div>,
    cell: ({ row }) => {
      const total_shipper_boxes: number = row.getValue("total_shipper_boxes");
      return <div className="capitalize">{total_shipper_boxes}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Created" />
    ),
    cell: ({ row }) => {
      const created_at: string = row.getValue("created_at");
      const formatted = new Intl.DateTimeFormat().format(new Date(created_at));
      return <div className="capitalize">{formatted}</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Modified" />
    ),
    cell: ({ row }) => {
      const updated_at: string = row.getValue("updated_at");
      const formatted = new Intl.DateTimeFormat().format(new Date(updated_at));
      return <div className="capitalize">{formatted}</div>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const productActorRef = ProductMachineContext.useActorRef();
      const productBatchActorRef = ProductBatchMachineContext.useActorRef();
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                productBatchActorRef.send({ type: "opening-modal" });
              }}
            >
              Add Batch
            </DropdownMenuItem>
            <DropdownMenuItem>View Product Batch Details</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white" />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                productActorRef.send({ type: "opening-modal" });
                productActorRef.send({ type: "set-is-editing" });
                productActorRef.send({
                  type: "typing",
                  data: {
                    productName: product.product_name,
                    productId: product.id,
                    totalQuantity: product.total_quantity,
                    totalShipperBoxes: product.total_shipper_boxes,
                  },
                });
              }}
            >
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem>Delete Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
