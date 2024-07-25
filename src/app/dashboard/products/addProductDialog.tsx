"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Fragment } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type AddProductFormValues = {
  productName: string;
  totalQuantity: number;
  totalShipperBoxes: number;
};

const addProductFormSchema = z.object({
  productName: z
    .string({
      required_error: "Product name is required",
      invalid_type_error: "Product name must be a string",
    })
    .min(2, {
      message: "Product name must be at least 2 characters.",
    }),
  totalQuantity: z
    .number({
      required_error: "Total quantity is required",
      // invalid_type_error: "Total quantity must be a number",
    })
    .nonnegative(),
  totalShipperBoxes: z
    .number({
      required_error: "Total shipper boxes is required",
      // invalid_type_error: "Total shipper boxes must be a number",
    })
    .nonnegative(),
});

export default function AddProductDialog() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    defaultValues: {
      productName: "",
      totalQuantity: 0,
      totalShipperBoxes: 0,
    },
    resolver: zodResolver(addProductFormSchema),
  });

  const onSubmit: SubmitHandler<AddProductFormValues> = async (
    data: z.infer<typeof addProductFormSchema>,
  ) => {
    console.log(data);
  };
  return (
    <Fragment>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex justify-end mx-4">
            <Button variant="outline" className="bg-white text-black" size="lg">
              ADD PRODUCT
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="lg:max-w-[40vw]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Let's create a new product</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productName" className="text-right">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  className="col-span-3"
                  defaultValue={getValues("productName")}
                  {...register("productName")}
                />
                <small className="flex justify-end col-span-4 text-red-700">
                  {errors.productName?.message}
                </small>
              </div>

              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="totalQuantity" className="text-right">
                  Total Quantity
                </Label>
                <Input
                  id="totalQuantity"
                  className="col-span-3"
                  type="number"
                  defaultValue={getValues("totalQuantity")}
                  readOnly
                  {...register("totalQuantity", { valueAsNumber: true })}
                />
                <small className="flex justify-end col-span-4 text-red-700">
                  {errors.totalQuantity?.message}
                </small>
              </div>

              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="totalShipperBoxes" className="text-right">
                  Total Shipper Boxes
                </Label>
                <Input
                  id="totalShipperBoxes"
                  className="col-span-3"
                  type="number"
                  defaultValue={getValues("totalShipperBoxes")}
                  readOnly
                  {...register("totalShipperBoxes", { valueAsNumber: true })}
                />
                <small className="flex justify-end col-span-4 text-red-700">
                  {errors.totalShipperBoxes?.message}
                </small>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-white text-black">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}