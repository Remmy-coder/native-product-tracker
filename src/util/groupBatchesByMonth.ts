import { BatchDetails } from "@/lib/machines/productOperationsMachine";

export function groupBatchesByMonth(batches: BatchDetails[]): { month: string; total: number }[] {
  const monthMap = new Map<string, { month: string; total: number }>();

  batches.forEach(batch => {
    const date = new Date(batch.exp_date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (monthMap.has(month)) {
      const existingEntry = monthMap.get(month)!;
      existingEntry.total += 1;
    } else {
      monthMap.set(month, { month, total: 1 });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => {
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');

    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);

    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });
}
