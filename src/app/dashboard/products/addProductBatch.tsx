import { ProductMachineContext } from "@/components/product-machine-provider";
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
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { extendedBatchSchema, validateAndCalculateBatchConfig } from "@/util/validateAndCalculateBatchConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  CircleCheckBig,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export type AddProductBatchFormValues = z.infer<typeof extendedBatchSchema> & {
  batch: Array<z.infer<typeof extendedBatchSchema>>;
};


export default function AddProductBatch() {
  const productSnapshot = ProductMachineContext.useSelector(
    (snapshot) => snapshot,
  );
  const productActorRef = ProductMachineContext.useActorRef();


  const form = useForm<AddProductBatchFormValues>({
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
    resolver: zodResolver(
      z.object({
        batch: z.array(extendedBatchSchema)
      })
    ),
  });

  const { fields, append, insert, remove } = useFieldArray({
    name: "batch",
    control: form.control,
  });

  const [batchCalculations, setBatchCalculations] = useState<{
    [index: number]: ReturnType<typeof validateAndCalculateBatchConfig>
  }>({});

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      productActorRef.send({ type: "opening-modal-batch" });
    } else {
      productActorRef.send({ type: "closing-modal-batch" });
    }
  };

  const handleInputChange =
    (field: keyof AddProductBatchFormValues["batch"][0], index: number) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        form.setValue(`batch.${index}.${field}`, value);

        if (field === 'packagesConfiguration' || field === 'boxes' || field === 'unitsPerPack') {
          const formValues = form.getValues(`batch.${index}`);
          const calculationResult = validateAndCalculateBatchConfig({
            packagesConfiguration: field === 'packagesConfiguration' ? value : formValues.packagesConfiguration,
            boxes: field === 'boxes' ? Number(value) : formValues.boxes,
            unitsPerPack: field === 'unitsPerPack' ? Number(value) : formValues.unitsPerPack,
          });

          setBatchCalculations(prev => ({
            ...prev,
            [index]: calculationResult
          }));

          if (calculationResult.isValid) {
            form.setValue(`batch.${index}.packsPerBox`, calculationResult.calculatedValues.packsPerBox);
            form.setValue(`batch.${index}.unitsPerBox`, calculationResult.calculatedValues.unitsPerBox);
            form.setValue(`batch.${index}.totalPacks`, calculationResult.calculatedValues.totalPacks);
          }
        }

        productActorRef.send({
          type: "typing-batch",
          data: form.getValues(),
        });
      };

  const onSubmit: SubmitHandler<AddProductBatchFormValues> = async (
    _data,
  ) => {
    productActorRef.send({ type: "creating-batch" })
  };

  useEffect(() => {
    if (!productSnapshot.context.productBatchFormModal) {
      form.reset();
      setBatchCalculations({});
    }
  }, [productSnapshot.context.productBatchFormModal]);


  useEffect(() => {
    if (productSnapshot.value === "success") {
      toast({
        className: "bg-green-700",
        title: "Batch Created",
      });
    }

    if (productSnapshot.value === "failure") {
      toast({
        className: "bg-red-700",
        title: "Batch Creation Error",
        description: productSnapshot.context.error as unknown as string,
      });
    }
  }, [productSnapshot.matches("success"), productSnapshot.matches("failure")]);

  return (
    <>
      <Fragment>
        <Dialog
          open={productSnapshot.context.productBatchFormModal}
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
                    <Fragment key={field.id}>
                      {index > 0 ? (
                        <hr className="border-dashed border-gray-400 " />
                      ) : null}
                      <div key={field.batchNo} className="grid grid-cols-2 gap-8">
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
                                      productActorRef.send({
                                        type: "typing-batch",
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
                                      productActorRef.send({
                                        type: "typing-batch",
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
                          render={({ field: formField }) => (
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
                                  onChange={(e) => {
                                    formField.onChange(e);
                                    handleInputChange('packagesConfiguration', index)(e);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Arrangement of products within a box. Example:
                                30 x 05 x 10 x 10 = (30 layers, 5 rows per
                                layer, 10 packs per row, 10 x 10 units per pack)
                              </FormDescription>
                              {batchCalculations[index]?.errors && (
                                <div className="text-red-500">
                                  {batchCalculations[index].errors.map((err, i) => (
                                    <p key={i}>{err}</p>
                                  ))}
                                </div>
                              )}
                              <FormMessage className="text-red-700" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`batch.${index}.packsPerBox`}
                          render={({ field: formField }) => (
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
                                  onChange={(e) => {
                                    formField.onChange(e);
                                    handleInputChange('packsPerBox', index)(e);
                                  }} />
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
                          render={({ field: formField }) => (
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
                                  onChange={(e) => {
                                    formField.onChange(e);
                                    handleInputChange('unitsPerPack', index)(e);
                                  }} />
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
                          render={({ field: formField }) => (
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
                                  onChange={(e) => {
                                    formField.onChange(e);
                                    handleInputChange('unitsPerBox', index)(e);
                                  }}
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
                          render={({ field: formField }) => (
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
                                  onChange={(e) => {
                                    formField.onChange(e);
                                    handleInputChange('boxes', index)(e);
                                  }} />
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
                      <div className="flex justify-between">
                        <div>
                          {batchCalculations[index]?.isValid && (
                            <div className="col-span-2 mt-0 px-4 rounded">
                              <h3 className="font-bold mb-2">Calculated Values:</h3>
                              <p>Packs per Box: {batchCalculations[index].calculatedValues.packsPerBox}</p>
                              <p>Units per Box: {batchCalculations[index].calculatedValues.unitsPerBox}</p>
                              <p>Total Packs: {batchCalculations[index].calculatedValues.totalPacks}</p>
                            </div>
                          )}
                        </div>
                        <div className="">
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
                              productActorRef.send({
                                type: "typing-batch",
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
                                productActorRef.send({
                                  type: "removing-batch",
                                  batchIndex: index,
                                });
                              }}
                            >
                              <MinusCircle className="mr-1 mt-0" />
                            </Button>
                          ) : null}
                        </div>
                      </div>


                    </Fragment>
                  );
                })}
                <div className="flex justify-center">
                  <Button type="submit" className="p-6 bg-white text-black">
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
