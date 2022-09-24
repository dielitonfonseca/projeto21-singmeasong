import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

export function validRecommendation() {
  return {
    name: "Falamansa - Xote dos Milagres",
    youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
  };
}
export function invalidRecommendation() {
  return {
    name: faker.random.word(),
    youtubeLink: faker.internet.url(),
  };
}

export async function createRecommendation() {
  const recommendation = validRecommendation();
  const response = await prisma.recommendation.create({ data: recommendation });
  return response;
}
