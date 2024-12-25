"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { BatchDetails } from "@/lib/machines/productOperationsMachine"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<BatchDetails>[] = [
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
    accessorKey: "mfg_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Manufactured" />
    ),
    cell: ({ row }) => {
      const mfg_date: string = row.getValue("mfg_date");
      const formatted = new Intl.DateTimeFormat().format(new Date(mfg_date));
      return <div className="capitalize">{formatted}</div>;
    },
  },
  {
    accessorKey: "exp_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expiration Date" />
    ),
    cell: ({ row }) => {
      const exp_date: string = row.getValue("exp_date");
      const formatted = new Intl.DateTimeFormat().format(new Date(exp_date));
      return <div className="capitalize">{formatted}</div>;
    },
  },
  {
    accessorKey: "batch_no",
    header: () => <div className="text-base">Batch No</div>,
    cell: ({ row }) => {
      const batch_no: string = row.getValue("batch_no");
      return <div className="capitalize">{batch_no.toLocaleUpperCase()}</div>;
    },
  },
  {
    accessorKey: "boxes",
    header: () => <div className="text-base">Box(es)</div>,
    cell: ({ row }) => {
      const box: number = row.getValue("boxes");
      return <div className="capitalize">{box.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "total_packs",
    header: () => <div className="text-base">Total Pack(s)</div>,
    cell: ({ row }) => {
      const total_packs: number = row.getValue("total_packs");
      return <div className="capitalize">{total_packs.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "packs_per_box",
    header: () => <div className="text-base">No Packs In A Box</div>,
    cell: ({ row }) => {
      const packs_per_box: number = row.getValue("packs_per_box");
      return <div className="capitalize">{packs_per_box.toLocaleString()}</div>;
    },
  },
]
