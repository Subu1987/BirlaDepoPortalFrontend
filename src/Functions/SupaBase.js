import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xajomtcmsdevsiadaivy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhham9tdGNtc2RldnNpYWRhaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3MjEyMTEsImV4cCI6MjAzNzI5NzIxMX0.rL_HDTbXwS6pgN9cL3H_a2Ay07W3ZhgJl1bLxLUbNyA"
);

export default supabase;
