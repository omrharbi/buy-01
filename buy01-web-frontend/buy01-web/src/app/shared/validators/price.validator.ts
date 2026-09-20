import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Price must be greater than zero — the subject's one explicit numeric rule. Written as its
 * own validator so the message lives beside the rule instead of inside a template.
 */
export function positivePrice(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '' || value === undefined) {
      return null; // `required` reports an empty field; this one only judges a value.
    }
    const price = Number(value);
    if (Number.isNaN(price)) {
      return { positivePrice: 'Enter a price as a number, like 240.00.' };
    }
    if (price <= 0) {
      return { positivePrice: 'Price must be greater than 0.' };
    }
    return null;
  };
}

/** Quantity is a whole number and never negative. */
export function wholeQuantity(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '' || value === undefined) {
      return null;
    }
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { wholeQuantity: 'Enter a whole number, 0 or more.' };
    }
    return null;
  };
}
