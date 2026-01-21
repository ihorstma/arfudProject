import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  foods: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    texture: v.string(),
    temperature: v.string(),
    isSafe: v.boolean(),
    inStock: v.boolean(),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isSafe", ["isSafe"])
    .index("by_category", ["category"])
    .index("by_texture", ["texture"])
    .index("by_temperature", ["temperature"])
    .index("by_inStock", ["inStock"])
    .index("by_isSafe_category", ["isSafe", "category"])
    .index("by_isSafe_texture", ["isSafe", "texture"])
    .index("by_isSafe_temperature", ["isSafe", "temperature"])
    .index("by_isSafe_inStock", ["isSafe", "inStock"]),
});
