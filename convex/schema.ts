import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  foods: defineTable({
    name: v.string(),
    isSafe: v.boolean(),
    inStock: v.boolean(),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    prepTime: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isSafe", ["isSafe"])
    .index("by_inStock", ["inStock"])
    .index("by_isSafe_inStock", ["isSafe", "inStock"]),
});
