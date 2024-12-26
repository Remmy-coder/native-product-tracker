"use client";

import { Fragment } from "react";
import AddProductDialog from "./addProductDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchDetails, Product } from "@/lib/machines/productOperationsMachine";
import { DataTable } from "@/components/ui/data-table";
import { columns, ViewProduct } from "./columns";
import { columns as bcolumns } from "./batch-columns"
import { ProductMachineContext } from "@/components/product-machine-provider";
import AddProductBatch from "./addProductBatch";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { groupBatchesByMonth } from "@/util/groupBatchesByMonth";

const chartConfig = {
  totalBatches: {
    label: "Expiring Batches",
    color: "#2563eb",
  },
  totalProducts: {
    label: "Products",
    color: "#FF0000",
  },
} satisfies ChartConfig

function transformFetchProductToViewProduct(item: {
  batch_details: BatchDetails[];
  product: Product;
}): ViewProduct {
  return {
    ...item.product,
    batch_details: item.batch_details,
  };
}

const CustomSubRow = ({ row }: { row: any }) => {
  return (
    <div className="px-10 mt-5 mb-8 capitalize">
      <p className="text-xl text-muted-foreground">
        {row?.original?.product_name} Batch Details
      </p>
      <DataTable
        columns={bcolumns}
        data={
          row?.original?.batch_details || []
        }
        filterBy="batch_no"
      />
    </div>
  );
};


function BatchDetailsBarChart() {
  const productSnapshot = ProductMachineContext.useSelector(
    (snapshot) => snapshot,
  );
  if (!productSnapshot.context.productData) {
    return null;
  }

  const getPath = (x: number, y: number, width: number, height: number) => (
    `M${x},${y + height}
   C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2}, ${y}
   C${x + width / 2},${y + height / 3} ${x + 2 * width / 3},${y + height} ${x + width}, ${y + height}
   Z`
  );

  const TriangleBar = (props: any) => {
    const {
      fill, x, y, width, height,
    } = props;

    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };

  return (
    <Card className="bg-black mx-5">
      <CardHeader>
        <CardTitle>Product Batch Bar Chart</CardTitle>
        <CardDescription>Displaying added products and expiring batches</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={groupBatchesByMonth(productSnapshot.context.productData.data)}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                />
              }
              cursor={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="totalBatches"
              fill="var(--color-totalBatches)"
              radius={8}
              shape={<TriangleBar />}
            />
            <Bar
              dataKey="totalProducts"
              fill="var(--color-totalProducts)"
              radius={8}
              shape={<TriangleBar />}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


export default function ProductPage() {
  const productSnapshot = ProductMachineContext.useSelector(
    (snapshot) => snapshot,
  );
  return (
    <Fragment>
      <div className="flex justify-between">
        <div className="flex min-h-[10vh]">
          <BatchDetailsBarChart />
        </div>
        <div>
          <AddProductDialog />
        </div>
      </div>
      <div className="px-4 mt-10 mb-5">
        <DataTable
          columns={columns}
          data={
            productSnapshot.context.productData
              ? productSnapshot.context.productData?.data.map((item) =>
                transformFetchProductToViewProduct(item),
              )
              : []
          }
          filterBy="product_name"
          renderSubRow={(row) => <CustomSubRow row={row} />}
        />
      </div>
      <div>
        <AddProductBatch />
      </div>
    </Fragment>
  );
}
