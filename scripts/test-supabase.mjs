import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE_URL present:", !!url);
console.log("SERVICE_ROLE_KEY present:", !!key);
console.log("SERVICE_ROLE_KEY length:", key?.length);

import ws from "ws";

const supabase = createClient(url, key, {
  realtime: { transport: ws },
});

const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/practice_sessions?select=count`, {
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  }
});
console.log('\n--- Raw fetch test ---');
console.log('raw fetch status:', response.status);
console.log('raw fetch body:', await response.text());

const result = await supabase
  .from("practice_sessions")
  .select("*", { count: "exact", head: true });

console.log("\n--- Full result ---");
console.log(JSON.stringify(result, null, 2));
console.log("\ncount:", result.count);
console.log("error:", JSON.stringify(result.error, null, 2));
console.log("status:", result.status);
console.log("statusText:", result.statusText);
