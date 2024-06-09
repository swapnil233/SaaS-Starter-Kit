import { PasswordRequirement } from "./PasswordRequirements";

export class PasswordValidator {
    private requirements: PasswordRequirement[];

    constructor(requirements: PasswordRequirement[]) {
        this.requirements = requirements;
    }

    checkPassword(password: string) {
        return this.requirements.map((requirement) => ({
            label: requirement.label,
            meets: requirement.regex.test(password),
        }));
    }
}