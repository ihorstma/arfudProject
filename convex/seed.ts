import { faker } from "@faker-js/faker"
import { v } from "convex/values"

import { internalMutation } from "./_generated/server"

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Drink"]
const TEXTURES = ["Crunchy", "Soft", "Smooth", "Chewy", "Liquid", "Mixed"]
const TEMPERATURES = ["Hot", "Cold", "Room Temp"]

export const generateFoods = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Generate 20 fake food items
    for (let i = 0; i < 20; i++) {
      const isSafe = faker.datatype.boolean()

      await ctx.db.insert("foods", {
        name: faker.food.dish(),
        description: faker.food.description(),
        category: faker.helpers.arrayElement(CATEGORIES),
        texture: faker.helpers.arrayElement(TEXTURES),
        temperature: faker.helpers.arrayElement(TEMPERATURES),
        isSafe: isSafe,
        inStock: faker.datatype.boolean(),
        imageUrl: faker.image.urlLoremFlickr({ category: "food", width: 300, height: 300 }),
        tags: faker.helpers.arrayElements(
          ["Sweet", "Salty", "Spicy", "Comfort", "Healthy", "Quick"],
          { min: 1, max: 3 },
        ),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
    console.log("Successfully added 20 fake food items!")
    return null
  },
})
