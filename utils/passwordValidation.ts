export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  strength?: "weak" | "medium" | "strong";
  requirements?: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePassword = (
  password: string
): PasswordValidationResult => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let strength: "weak" | "medium" | "strong" = "weak";
  if (metRequirements >= 4) strength = "strong";
  else if (metRequirements >= 2) strength = "medium";

  // Check minimum requirements
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long.",
      strength,
      requirements,
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Password must not exceed 128 characters.",
      strength,
      requirements,
    };
  }

  if (!requirements.hasUpperCase) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter.",
      strength,
      requirements,
    };
  }

  if (!requirements.hasLowerCase) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter.",
      strength,
      requirements,
    };
  }

  if (!requirements.hasNumber) {
    return {
      isValid: false,
      error: "Password must contain at least one number.",
      strength,
      requirements,
    };
  }

  if (!requirements.hasSpecialChar) {
    return {
      isValid: false,
      error:
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
      strength,
      requirements,
    };
  }

  return {
    isValid: true,
    strength,
    requirements,
  };
};

export const getPasswordStrengthColor = (
  strength?: "weak" | "medium" | "strong"
): string => {
  switch (strength) {
    case "strong":
      return "text-emerald-600";
    case "medium":
      return "text-amber-600";
    case "weak":
      return "text-rose-600";
    default:
      return "text-slate-400";
  }
};

export const getPasswordStrengthBg = (
  strength?: "weak" | "medium" | "strong"
): string => {
  switch (strength) {
    case "strong":
      return "bg-emerald-600";
    case "medium":
      return "bg-amber-600";
    case "weak":
      return "bg-rose-600";
    default:
      return "bg-slate-200";
  }
};
