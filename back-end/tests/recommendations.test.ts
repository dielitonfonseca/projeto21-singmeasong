import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";
import { faker } from "@faker-js/faker";
import { invalidRecommendation } from "./factories/recommendationFactory.js";

const agent = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
});

describe("POST /recommendations", () => {
  it("Should answer with status 201 when given valid Recommendation", async () => {
    const body = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
    };
    const response = await agent.post("/recommendations").send(body);
    expect(response.status).toBe(201);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: body.name },
    });
    expect(recommendationCreated).not.toBeNull();
  });
  it("Should answer with status 422 when given invalid recommendation", async () => {
    const body = invalidRecommendation();
    const response = await agent.post("/recommendations").send(body);
    expect(response.status).toBe(422);
    const recommendationCreated = await prisma.recommendation.findFirst({ where: { name: body.name } });
    expect(recommendationCreated).toBeNull();
  });

  it("Should answer with status 422 when given empty body", async () => {
    const body = {};
    const response = await agent.post("/recommendations").send(body);
    expect(response.status).toBe(422);
  });
});

describe("POST /recommendations/:id/upvote", () => {});
describe("POST /recommendations/:id/downvote", () => {});
describe("GET /recommendations", () => {});
describe("GET /recommendations/:id", () => {});
describe("GET /recommendations/random", () => {});
describe("GET /recommendations/top/:amount", () => {});

afterAll(async () => {
  await prisma.$disconnect();
});
