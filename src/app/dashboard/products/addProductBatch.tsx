import { ProductBatchMachineContext } from "@/components/product-batch-machine-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  CircleCheckBig,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { Fragment, useEffect } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export type AddProductBatchFormValues = {
  productId?: string;
  batch: {
    batchNo: string;
    mfgDate: Date;
    expDate: Date;
    boxes: number;
    unitsPerBox: number;
    unitsPerPack: number;
    packsPerBox: number;
    packagesConfiguration: string;
    totalPacks: number;
  }[];
};

type PackageConfig = [string, string, string, string];

const addProductBatchFormSchema = z.object({
  batch: z.array(
    z.object({
      batchNo: z
        .string({
          required_error: "Batch number is required",
          invalid_type_error: "Batch number must be a string",
        })
        .min(2, {
          message: "Batch number must be at least 2 characters.",
        }),
      mfgDate: z.date({
        required_error: "Manufactured date is required",
        invalid_type_error: "Manufactured date must be a valid date",
      }),
      expDate: z.date({
        required_error: "Expiration date is required",
        invalid_type_error: "Expiration date must be a date",
      }),
      boxes: z
        .number({
          required_error: "Number of boxes is required",
          invalid_type_error: "Number of boxes must be a number",
        })
        .positive({ message: "Number of boxes be greater than 0" }),
      unitsPerBox: z
        .number({
          required_error: "Units per box is required",
          invalid_type_error: "Units per box must be a number",
        })
        .positive({ message: "Units per box must be greater than 0" }),
      unitsPerPack: z
        .number({
          required_error: "Units per pack is required",
          invalid_type_error: "Units per pack must be a number",
        })
        .positive({ message: "Units per pack must be greater than 0" }),
      packsPerBox: z
        .number({
          required_error: "Packs per box is required",
          invalid_type_error: "Packs per box must be a number",
        })
        .positive({ message: "Packs per box must be greater than 0" }),
      packagesConfiguration: z
        .string({
          required_error: "Package configuration is required",
          invalid_type_error: "Package configuration must be a string",
        })
        .min(2, {
          message: "Package configuration must be at least 2 characters",
        }),
      totalPacks: z.number({
        required_error: "Total packs is required",
        invalid_type_error: "Total packs must be a number",
      }),
    }),
  ),
});

export default function AddProductBatch() {
  const productBatchSnapshot = ProductBatchMachineContext.useSelector(
    (snapshot) => snapshot,
  );
  const productBatchActorRef = ProductBatchMachineContext.useActorRef();

  const form = useForm<z.infer<typeof addProductBatchFormSchema>>({
    defaultValues: {
      batch: [
        {
          batchNo: "",
          mfgDate: undefined,
          expDate: undefined,
          boxes: 0,
          unitsPerBox: 0,
          unitsPerPack: 0,
          packsPerBox: 0,
          packagesConfiguration: "",
          totalPacks: 0,
        },
      ],
    },
    mode: "onBlur",
    resolver: zodResolver(addProductBatchFormSchema),
  });

  const { fields, append, insert, remove } = useFieldArray({
    name: "batch",
    control: form.control,
  });

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      productBatchActorRef.send({ type: "opening-modal" });
    } else {
      productBatchActorRef.send({ type: "closing-modal" });
    }
  };

  const handleInputChange =
    (field: keyof AddProductBatchFormValues["batch"][0], index: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      form.setValue(`batch.${index}.${field}`, value);
      productBatchActorRef.send({
        type: "typing",
        data: {
          ...form.getValues(),
          batch: form
            .getValues()
            .batch.map((batchItem, i) =>
              i === index ? { ...batchItem, [field]: value } : batchItem,
            ),
        },
      });
    };

  const onSubmit: SubmitHandler<AddProductBatchFormValues> = async (
    data: z.infer<typeof addProductBatchFormSchema>,
  ) => {
    console.log(data);
  };

  useEffect(() => {
    if (!productBatchSnapshot.context.productBatchFormModal) {
      form.reset();
    }
  }, [productBatchSnapshot.context.productBatchFormModal]);

  console.log(productBatchSnapshot.context.productBatchFormData);
  return (
    <>
      <Fragment>
        <Dialog
          open={productBatchSnapshot.context.productBatchFormModal}
          onOpenChange={handleDialogOpenChange}
        >
          <DialogContent className="lg:max-w-[40vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product Batch</DialogTitle>
              <DialogDescription>
                Let's add a batch to the product
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10 mt-3 ml-3"
              >
                {fields.map((field, index) => {
                  return (
                    <Fragment>
                      {index > 0 ? (
                        <hr className="border-dashed border-gray-400 " />
                      ) : null}
                      <div key={field.id} className="grid grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name={`batch.${index}.mfgDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.mfgDate === undefined ? `` : `text-red-700`}`}
                              >
                                Manufactured Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 bg-black"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(_, selectedDate) => {
                                      field.onChange(selectedDate);
                                      productBatchActorRef.send({
                                        type: "typing",
                                        data: {
                                          ...form.getValues(),
                                          batch: form
                                            .getValues()
                                            .batch.map((batchItem, i) =>
                                              i === index
                                                ? {
                                                    ...batchItem,
                                                    mfgDate: selectedDate,
                                                  }
                                                : batchItem,
                                            ),
                                        },
                                      });
                                    }}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.expDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.expDate === undefined ? `` : `text-red-700`}`}
                              >
                                Expiration Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 bg-black"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(_, selectedDate) => {
                                      field.onChange(selectedDate);
                                      productBatchActorRef.send({
                                        type: "typing",
                                        data: {
                                          ...form.getValues(),
                                          batch: form
                                            .getValues()
                                            .batch.map((batchItem, i) =>
                                              i === index
                                                ? {
                                                    ...batchItem,
                                                    expDate: selectedDate,
                                                  }
                                                : batchItem,
                                            ),
                                        },
                                      });
                                    }}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.packagesConfiguration`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.packagesConfiguration === undefined ? `` : `text-red-700`}`}
                              >
                                Package Configuration
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="_____ x _____ x _____ x _____"
                                  {...form.register(
                                    `batch.${index}.packagesConfiguration` as const,
                                  )}
                                  onChange={handleInputChange(
                                    "packagesConfiguration",
                                    index,
                                  )}
                                />
                              </FormControl>
                              <FormDescription>
                                Arrangement of products within a box. Example:
                                30 x 05 x 10 x 10 = (30 layers, 5 rows per
                                layer, 10 packs per row, 10 x 10 units per pack)
                              </FormDescription>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.packsPerBox`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.packsPerBox === undefined ? `` : `text-red-700`}`}
                              >
                                Packs Per Box
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...form.register(
                                    `batch.${index}.packsPerBox` as const,
                                    { valueAsNumber: true },
                                  )}
                                  onChange={handleInputChange(
                                    "packsPerBox",
                                    index,
                                  )}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of packs inside a single box. Example:
                                150 packs = (30 layers x 5 packs per layer)
                              </FormDescription>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.unitsPerPack`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.unitsPerPack === undefined ? `` : `text-red-700`}`}
                              >
                                Units Per Pack
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...form.register(
                                    `batch.${index}.unitsPerPack` as const,
                                    { valueAsNumber: true },
                                  )}
                                  onChange={handleInputChange(
                                    "unitsPerPack",
                                    index,
                                  )}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of individual units (e.g., capsules) in a
                                single pack. Example: 100 capsules per pack =
                                (10 x 10 pack)
                              </FormDescription>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.unitsPerBox`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.unitsPerBox === undefined ? `` : `text-red-700`}`}
                              >
                                Units Per Box
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...form.register(
                                    `batch.${index}.unitsPerBox` as const,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of individual units (e.g., capsules) in a
                                single box. Example: 15, 000 per box = (100
                                capsules x 150 packs)
                              </FormDescription>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.boxes`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.boxes === undefined ? `` : `text-red-700`}`}
                              >
                                Boxes
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...form.register(
                                    `batch.${index}.boxes` as const,
                                    { valueAsNumber: true },
                                  )}
                                  onChange={handleInputChange("boxes", index)}
                                />
                              </FormControl>
                              <FormDescription>
                                Total number of boxes for this batch
                              </FormDescription>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.batchNo`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel
                                className={`${form?.formState?.errors?.batch?.[index]?.batchNo === undefined ? `` : `text-red-700`}`}
                              >
                                Batch Code
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...form.register(
                                    `batch.${index}.batchNo` as const,
                                  )}
                                  onChange={handleInputChange("batchNo", index)}
                                />
                              </FormControl>
                              <Button
                                size="sm"
                                className="bg-green-700 w-40 cursor-pointer"
                                onClick={() => {
                                  form.setFocus(`batch.${index}.batchNo`);
                                }}
                              >
                                Scan batch code.
                              </Button>
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        {/* <Input
                        value={`${extractValues(form.getValues(`batch.${index}.packagesConfiguration`), "x")[0]} layers, ${extractValues(form.getValues(`batch.${index}.packagesConfiguration`), "x")[1]} rows per layers`}
                      />*/}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          className="bg-white text-black"
                          size="icon"
                          onClick={() => {
                            insert(index + 1, {
                              batchNo: "",
                              mfgDate: form.getValues(`batch.${index}.mfgDate`),
                              expDate: form.getValues(`batch.${index}.expDate`),
                              boxes: 0,
                              unitsPerBox: 0,
                              unitsPerPack: 0,
                              packsPerBox: 0,
                              packagesConfiguration: "",
                              totalPacks: 0,
                            });
                            productBatchActorRef.send({
                              type: "typing",
                              data: {
                                ...form.getValues(),
                                batch: form
                                  .getValues()
                                  .batch.map((batchItem, i) =>
                                    i === index + 1
                                      ? {
                                          ...batchItem,
                                          mfgDate: form.getValues(
                                            `batch.${index}.mfgDate`,
                                          ),
                                          expDate: form.getValues(
                                            `batch.${index}.expDate`,
                                          ),
                                        }
                                      : batchItem,
                                  ),
                              },
                            });
                          }}
                        >
                          <PlusCircle className="mr-1 mt-0" />
                        </Button>
                        {index > 0 ? (
                          <Button
                            className="bg-white text-black ml-1"
                            size="icon"
                            onClick={() => {
                              remove(index);
                              // productBatchActorRef.send({
                              //   type: "removing-batch",
                              //   batchIndex: index,
                              // });
                            }}
                          >
                            <MinusCircle className="mr-1 mt-0" />
                          </Button>
                        ) : null}
                      </div>
                    </Fragment>
                  );
                })}
                <div>
                  <Button type="submit" className="bg-white text-black">
                    Submit
                    <CircleCheckBig className="ml-1 mt-0" />
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Fragment>
    </>
  );
}
