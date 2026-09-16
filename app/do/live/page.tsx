import { redirect } from "next/navigation";
import LiveDo from "./LiveDo";
export const metadata = {
  title: "Your DO",
  robots: { index: false, follow: false },
};
export default function Page() {
  if (process.env.NODE_ENV !== "development") redirect("/do?open=1");
  return <LiveDo />;
}
