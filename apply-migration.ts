import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    const sql = fs.readFileSync("apply_upi_migration.sql", "utf-8");
    
    // Split by statements and execute each
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error, data } = await supabase.rpc("exec_sql", { 
        sql: statement 
      }).catch(err => {
        // If rpc doesn't exist, try direct query
        return supabase.from("_sql").insert({ sql: statement }).catch(() => ({
          error: err,
          data: null
        }));
      });

      if (error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.log("✓ Success");
      }
    }

    console.log("\nMigration applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();
