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
import React, { Fragment, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ProductMachineContext } from "@/components/product-machine-provider";

export type AddProductFormValues = {
  clientId?: string;
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
      invalid_type_error: "Total quantity must be a number",
    })
    .nonnegative(),
  totalShipperBoxes: z
    .number({
      required_error: "Total shipper boxes is required",
      invalid_type_error: "Total shipper boxes must be a number",
    })
    .nonnegative(),
});

export default function AddProductDialog() {
  const [open, setOpen] = React.useState(false);

  const productSnapshot = ProductMachineContext.useSelector(
    (snapshot) => snapshot,
  );
  const productActorRef = ProductMachineContext.useActorRef();

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    defaultValues: {
      productName: "",
      totalQuantity: 0,
      totalShipperBoxes: 0,
    },
    resolver: zodResolver(addProductFormSchema),
  });

  const handleInputChange =
    (field: keyof AddProductFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValue(field, value as any);
      productActorRef.send({
        type: "typing",
        data: {
          ...getValues(),
          [field]: value,
        },
      });
    };

  const onSubmit: SubmitHandler<AddProductFormValues> = async (
    _data: z.infer<typeof addProductFormSchema>,
  ) => {
    productActorRef.send({ type: "creating" });
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (productSnapshot.value === "success") {
      toast({
        className: "bg-green-700",
        title: "Product Created",
      });
      setOpen(false);
    }

    if (productSnapshot.value === "failure") {
      toast({
        className: "bg-red-700",
        title: "Product Creation Error",
        description: productSnapshot.context.error as unknown as string,
      });
    }
  }, [productSnapshot.matches("success"), productSnapshot.matches("failure")]);
  return (
    <Fragment>
      <Dialog open={open} onOpenChange={setOpen}>
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
                  onChange={handleInputChange("productName")}
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
                  onChange={handleInputChange("totalQuantity")}
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
                  onChange={handleInputChange("totalShipperBoxes")}
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
