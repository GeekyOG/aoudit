import * as Yup from "yup";

export const firstNameValidation = Yup.string()
  .trim()
  .min(2, "First Name must be at least 2 characters long")
  .max(30, "First Name must not exceed 30 characters")
  .matches(/^[A-Za-z'-]+$/, "Only letters, hyphens, or apostrophes are allowed")
  .test(
    "no-trailing-punctuation",
    "Trailing punctuation is not allowed",
    (value) => {
      if (value?.trim() && /[^A-Za-z]$/.test(value?.trim())) {
        return new Yup.ValidationError(
          "First Name should not end with punctuation",
          null,
          "firstName"
        );
      }
      return true;
    }
  )
  .required("First Name is required");

export const lastNameValidation = Yup.string()
  .trim()
  .min(2, "Last Name must be at least 2 characters long")
  .max(30, "Last Name must not exceed 30 characters")
  .matches(/^[A-Za-z'-]+$/, "Only letters, hyphens, or apostrophes are allowed")
  .test(
    "no-trailing-punctuation",
    "Trailing punctuation is not allowed",
    (value) => {
      if (value && /[^A-Za-z]$/.test(value)) {
        return new Yup.ValidationError(
          "Last Name should not end with punctuation",
          null,
          "lastName"
        );
      }
      return true;
    }
  )
  .required("Last Name is required");

export const nameValidation = Yup.string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(30, "Name cannot be more than 30 characters")
  .matches(
    /^[A-Za-z'-\s]+$/,
    "Only letters, hyphens, or apostrophes are allowed"
  )
  .test(
    "no-trailing-punctuation",
    "Trailing punctuation is not allowed",
    (value) => {
      if (value?.trim() && /[^A-Za-z]$/.test(value?.trim())) {
        return new Yup.ValidationError(
          "Name should not end with punctuation",
          null,
          "name"
        );
      }
      return true;
    }
  )
  .required("Name is required");

export const emailAddressValidation = Yup.string()
  .trim()
  .email("Please enter a valid email address")
  .required("Email Address is required");

export const phoneNumberValidation = Yup.string()
  .matches(
    /^0\d{10}$/,
    " Ensure the phone number starts with 0 and must be at least 11 numbers digits"
  )
  .min(11, "Phone Number must be at least 11 numbers")
  .max(11, "Phone Number cannot exceed 11 numbers")
  .optional();
