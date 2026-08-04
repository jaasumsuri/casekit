import { redirect } from "next/navigation";

// /learn has no index of its own — the case library lives at /cases.
// This route previously rendered an empty page; redirect so any existing
// links or bookmarks land somewhere real.
export default function Page() {
  redirect("/cases");
}
