import { PasswordRequirement } from "@/lib/auth/PasswordRequirements";
import { PasswordValidator } from "@/lib/auth/PasswordValidator";

export class PasswordValidationServices {
  private validator: PasswordValidator;

  constructor() {
    const passwordRequirements: PasswordRequirement[] = [
      new PasswordRequirement("At least 6 characters", /.{6,}/),
      new PasswordRequirement("At least one uppercase letter", /[A-Z]/),
      new PasswordRequirement("At least one lowercase letter", /[a-z]/),
      new PasswordRequirement("At least one number", /[0-9]/),
      new PasswordRequirement("At least one special character", /[^A-Za-z0-9]/),
    ];

    this.validator = new PasswordValidator(passwordRequirements);
  }

  validate(password: string) {
    return this.validator.checkPassword(password);
  }
}
