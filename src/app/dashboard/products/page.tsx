"use client";

import { Fragment } from "react";
import AddProductDialog from "./addProductDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchDetails, Product } from "@/lib/machines/productOperationsMachine";
import { DataTable } from "@/components/ui/data-table";
import { columns, ViewProduct } from "./columns";
import { ProductMachineContext } from "@/components/product-machine-provider";

export default function ProductPage() {
  const productSnapshot = ProductMachineContext.useSelector(
    (snapshot) => snapshot,
  );

  function transformFetchProductToViewProduct(item: {
    batch_details: BatchDetails[];
    product: Product;
  }): ViewProduct {
    return item.product;
  }
  return (
    <Fragment>
      <div className="flex justify-between">
        <div className="flex min-h-[10vh]">
          <Card className="min-w-[20vw] mx-4 bg-transparent">
            <CardHeader>
              <CardTitle>Opening Product's Stock Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Newly Added: 40</p>
              <p>Product's Total Quantity: 3000</p>
              <p>Product's Marked as Damaged: 3000</p>
            </CardContent>
          </Card>
          <Card className="min-w-[20vw]">
            <CardHeader>
              <CardTitle>Closing Product's Stock Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Newly Added: 40</p>
              <p>Product's Total Quantity: 3000</p>
              <p>Product's Marked as Damaged: 20</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <AddProductDialog />
        </div>
      </div>
      <div>
        <DataTable
          columns={columns}
          data={
            productSnapshot.context.productData
              ? productSnapshot.context.productData?.data.map((item) =>
                  transformFetchProductToViewProduct(item),
                )
              : []
          }
        />
      </div>
    </Fragment>
  );
}
