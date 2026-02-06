import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  foods: defineTable({
    ownerId: v.optional(v.string()),
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
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_isSafe", ["ownerId", "isSafe"])
    .index("by_ownerId_and_category", ["ownerId", "category"])
    .index("by_ownerId_and_texture", ["ownerId", "texture"])
    .index("by_ownerId_and_temperature", ["ownerId", "temperature"])
    .index("by_ownerId_and_inStock", ["ownerId", "inStock"])
    .index("by_isSafe", ["isSafe"])
    .index("by_category", ["category"])
    .index("by_texture", ["texture"])
    .index("by_temperature", ["temperature"])
    .index("by_inStock", ["inStock"])
    .index("by_isSafe_and_category", ["isSafe", "category"])
    .index("by_isSafe_and_texture", ["isSafe", "texture"])
    .index("by_isSafe_and_temperature", ["isSafe", "temperature"])
    .index("by_isSafe_and_inStock", ["isSafe", "inStock"]),
})
