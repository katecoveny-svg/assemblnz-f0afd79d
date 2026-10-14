import { PersonalDo } from "./personal/PersonalDo";

/** /do is the working product. /do/personal remains a compatible entry for installed DO. */
export function DoHome() {
  return <PersonalDo />;
}
