"use client";

import { Fragment } from "react";
import AddProductDialog from "./addProductDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage() {
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
        <AddProductDialog />
      </div>
    </Fragment>
  );
}
