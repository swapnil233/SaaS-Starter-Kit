import { PasswordRequirement } from "@/lib/auth/PasswordRequirements";
import { PasswordValidator } from "@/lib/auth/PasswordValidator";

export class PasswordValidationServices {
  private validator: PasswordValidator;

  constructor() {
    const passwordRequirements: PasswordRequirement[] = [
      new PasswordRequirement("At least 6 characters", /.{6,}/),
      new PasswordRequirement("1 or more upper case letters", /[A-Z]/),
      new PasswordRequirement("1 or more numbers", /[0-9]/),
      new PasswordRequirement("1 or more special characters", /[^A-Za-z0-9]/),
    ];

    this.validator = new PasswordValidator(passwordRequirements);
  }

  validate(password: string) {
    return this.validator.checkPassword(password);
  }
}
