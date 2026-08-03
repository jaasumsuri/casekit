import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PracticeClient from "./PracticeClient";

export default async function PracticeModePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/practice");
  }
  return <PracticeClient />;
}
