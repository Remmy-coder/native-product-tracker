
import { BatchDetails, Product } from "@/lib/machines/productOperationsMachine";

export function groupBatchesByMonth(
  products: {
    batch_details: Array<BatchDetails>;
    product: Product;
  }[]
): {
  month: string;
  totalBatches: number;
  totalProducts: number;
}[] {
  const monthMap = new Map<string, { month: string; totalBatches: number; totalProducts: number }>();

  products.forEach(product => {
    product.batch_details.forEach(batch => {
      const batchExpDate = new Date(batch.exp_date);
      const batchMonth = batchExpDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (monthMap.has(batchMonth)) {
        const existingEntry = monthMap.get(batchMonth)!;
        existingEntry.totalBatches += 1;
      } else {
        monthMap.set(batchMonth, { month: batchMonth, totalBatches: 1, totalProducts: 0 });
      }
    });

    const productCreatedDate = new Date(product.product.created_at);
    const productMonth = productCreatedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (monthMap.has(productMonth)) {
      const existingEntry = monthMap.get(productMonth)!;
      existingEntry.totalProducts += 1;
    } else {
      monthMap.set(productMonth, { month: productMonth, totalBatches: 0, totalProducts: 1 });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => {
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');

    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);

    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });
}


