import { requirements } from "./passwordRequirements";

export default function isPasswordValid(password: string) {
  if (password.length <= 5) return false;
  return requirements.every((requirement) => requirement.re.test(password));
}
