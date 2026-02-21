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

export function formatSnakeCase(text: string) {
  if (!text) return "";

  if (text.includes("_")) {
    return text
      .split("_")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  return text;
}

export function getDecimalPart(value: number) {
  if (!Number.isFinite(value)) return null;

  const fixed = value.toFixed(2);
  const hasDecimal = fixed.includes(".");

  if (hasDecimal) {
    const decimalPart = fixed.split(".")[1];
    return decimalPart;
  }

  return "";
}
