import { ValidationErrors } from '@angular/forms';

/**
 * Turns a control's first failing validator into a sentence. Our own validators already carry
 * their message; the built-in ones are mapped here so the wording is the same everywhere.
 */
export function firstErrorMessage(errors: ValidationErrors | null, label: string): string | null {
  if (!errors) {
    return null;
  }
  const [key, value] = Object.entries(errors)[0];

  if (typeof value === 'string') {
    return value;
  }

  switch (key) {
    case 'required':
      return `${label} is required.`;
    case 'email':
      return 'Enter an email address like name@example.com.';
    case 'minlength':
      return `Use at least ${value.requiredLength} characters.`;
    case 'maxlength':
      return `Keep ${label.toLowerCase()} under ${value.requiredLength} characters.`;
    case 'min':
      return `Enter ${value.min} or more.`;
    case 'max':
      return `Enter ${value.max} or less.`;
    default:
      return `${label} isn't valid.`;
  }
}
