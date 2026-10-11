import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
}

async function main() {
  const name = "Hosam Jleta";
  const email = "hosam.jleta@gmail.com";
  const defaultPassword = "AdminPassword123!";

  console.log("=== Checking admin account ===");

  try {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({ role: "admin", status: "active" })
        .where(eq(users.email, email));
      console.log(`Updated existing account (${email}) to admin.`);
    } else {
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const id = generateId("usr");

      await db.insert(users).values({
        id,
        name,
        email,
        passwordHash,
        role: "admin",
        status: "active",
      });
      console.log(`Created new admin account: ${email}`);
      console.log(`User ID: ${id}`);
    }
  } catch (err) {
    console.error("Error setting up admin account:", err);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
