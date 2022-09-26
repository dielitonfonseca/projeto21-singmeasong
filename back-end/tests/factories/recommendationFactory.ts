import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

export function validRecommendation(score?: number) {
  return {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
    score: score ? score : +faker.random.numeric(),
  };
}

export function invalidRecommendation() {
  return {
    name: faker.music.songName(),
    youtubeLink: faker.internet.url(),
  };
}

export async function createRecommendation(scoreDefault?: boolean) {
  const recommendation = validRecommendation();
  if (scoreDefault) {
    delete recommendation.score;
  }
  const response = await prisma.recommendation.create({ data: recommendation });
  return response;
}
