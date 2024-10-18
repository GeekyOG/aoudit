export function formatAmount(amount: number) {
  return Number(amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });
}
