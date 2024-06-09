export class PasswordRequirement {
    label: string;
    regex: RegExp;

    constructor(label: string, regex: RegExp) {
        this.label = label;
        this.regex = regex;
    }
}