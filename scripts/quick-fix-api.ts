// Quick fix for the API route - lower the threshold
import { writeFileSync, readFileSync } from "fs"
import { resolve } from "path"

const apiRoutePath = resolve(process.cwd(), "app/api/movies/recommendations/route.ts")

try {
  console.log("🔧 Fixing API route threshold...")

  let content = readFileSync(apiRoutePath, "utf-8")

  // Replace the high threshold with a lower one
  content = content.replace(
    /threshold: z\.coerce\.number$$$$\.min$$0\.1$$\.max$$1\.0$$\.default$$0\.75$$/,
    "threshold: z.coerce.number().min(0.1).max(1.0).default(0.3)",
  )

  // Also replace any hardcoded 0.75 values
  content = content.replace(/match_threshold: 0\.75/g, "match_threshold: 0.3")
  content = content.replace(/threshold: 0\.75/g, "threshold: 0.3")

  writeFileSync(apiRoutePath, content)

  console.log("✅ API route threshold lowered from 0.75 to 0.3")
  console.log("🚀 Redeploy your app: git add . && git commit -m 'Lower API threshold' && git push")
} catch (error) {
  console.error("❌ Failed to fix API route:", error)
  console.log("🔧 Manually edit app/api/movies/recommendations/route.ts")
  console.log("Change .default(0.75) to .default(0.3)")
}
