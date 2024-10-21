export function formatAmount(amount: number) {
  if (isNaN(amount)) {
    return "--";
  }
  return Number(amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });
}

export const formatNumber = (number) => {
  const parsedNumber = parseInt(number, 10);

  // Check if parsedNumber is NaN
  if (isNaN(parsedNumber)) {
    return ""; // Return empty string if the number is invalid
  }

  const formattedNumber = parsedNumber.toLocaleString("en-NG");
  return formattedNumber;
};
