export function formatAmount(amount: number) {
  return Number(amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });
}

export const formatNumber = (number) => {
  const parsedNumber = parseInt(number, 10);

  console.log(number);

  // Check if parsedNumber is NaN
  if (isNaN(parsedNumber)) {
    console.log("Invalid number:", number); // Log if the number is invalid (NaN)
    return ""; // Return empty string if the number is invalid
  }

  const formattedNumber = parsedNumber.toLocaleString("en-NG");
  console.log(formattedNumber, "Formatted number");
  return formattedNumber;
};
