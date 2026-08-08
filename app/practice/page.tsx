import PracticeClient from "./PracticeClient";

/* Catalog is public — visitors need to see the 12 cases, industry mix, and
   difficulty range before deciding to sign in. The auth gate lives on
   /practice/[slug] (starting a session), not on browsing this list. */
export default function PracticeModePage() {
  return <PracticeClient />;
}
