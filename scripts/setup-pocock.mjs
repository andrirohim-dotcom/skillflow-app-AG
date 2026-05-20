import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables in env");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const POCOCK_SOURCES = [
  {
    title: "Total TypeScript Core",
    creator_name: "Matt Pocock",
    url: "https://www.totaltypescript.com/core-workshops",
    source_type: "course",
    topic_tags: ["TypeScript", "Advanced Development", "Software Architecture"],
    skill_targets: ["TypeScript Generics", "Type Transformations", "Inference"],
    difficulty_level: "advanced",
    description: "The professional's guide to mastering TypeScript. Covering generics, type transformations, and advanced patterns.",
    language: "en",
    is_published: true,
  },
  {
    title: "TypeScript Wizards YouTube",
    creator_name: "Matt Pocock",
    url: "https://www.youtube.com/@mattpocock",
    source_type: "youtube",
    topic_tags: ["TypeScript", "Development Tips", "Productivity"],
    skill_targets: ["Discriminated Unions", "Mapped Types", "Conditional Types"],
    difficulty_level: "intermediate",
    description: "Short, punchy videos explaining the trickiest parts of TypeScript in plain English.",
    language: "en",
    is_published: true,
  },
  {
    title: "Effective TypeScript",
    creator_name: "Dan Vanderkam (Recommended by Matt Pocock)",
    url: "https://effectivetypescript.com/",
    source_type: "book",
    topic_tags: ["TypeScript", "Best Practices", "Software Quality"],
    skill_targets: ["TypeScript Fundamentals", "Type Safety", "Refactoring"],
    difficulty_level: "intermediate",
    description: "62 specific ways to improve your use of TypeScript. Essential reading for every TS developer.",
    language: "en",
    is_published: true,
  },
  {
    title: "Zod: Type-Safe Schema Validation",
    creator_name: "Colin McDonnell (Matt Pocock Tutorial)",
    url: "https://zod.dev/",
    source_type: "course",
    topic_tags: ["Validation", "TypeScript", "Runtime Safety"],
    skill_targets: ["Schema Validation", "Zod", "Type Inference"],
    difficulty_level: "intermediate",
    description: "Master Zod to bring runtime type safety to your TypeScript applications.",
    language: "en",
    is_published: true,
  }
];

async function setup() {
  console.log("🚀 Seeding Matt Pocock's curriculum into master_sources...");
  
  for (const source of POCOCK_SOURCES) {
    // Check if exists
    const { data: existing } = await admin
      .from("master_sources")
      .select("id")
      .eq("title", source.title)
      .maybeSingle();

    if (existing) {
      console.log(`- Updating: ${source.title}`);
      await admin.from("master_sources").update(source).eq("id", existing.id);
    } else {
      console.log(`- Inserting: ${source.title}`);
      await admin.from("master_sources").insert(source);
    }
  }

  console.log("✅ Success! Matt Pocock's skills are now available for all users.");
}

setup();
