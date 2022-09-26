import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";
import { faker } from "@faker-js/faker";
import { createRecommendation, invalidRecommendation } from "./factories/recommendationFactory.js";

const agent = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
});

describe("POST /recommendations", () => {
  it("Should answer with status 201 when given valid Recommendation", async () => {
    const body = { name: faker.music.songName(), youtubeLink: "https://www.youtube.com/watch?v=ePjtnSPFWK8&ab_channel=CHXVEVO" };
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

describe("POST /recommendations/:id/upvote", () => {
  it("Should answer with status 200 when give a valid id", async () => {
    const recommendation = await createRecommendation();
    const response = await agent.post(`/recommendations/${recommendation.id}/upvote`).send({});
    expect(response.status).toBe(200);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationCreated.score).toBe(recommendation.score + 1);
  });
  it("Should answer with status 404 when give a invalid id", async () => {
    const response = await agent.post(`/recommendations/5/upvote`).send({});
    expect(response.status).toBe(404);
  });
});

describe("POST /recommendations/:id/downvote", () => {
  it("Should answer with status 200 when give a valid id", async () => {
    const recommendation = await createRecommendation();
    const response = await agent.post(`/recommendations/${recommendation.id}/downvote`).send({});
    expect(response.status).toBe(200);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationCreated.score).toBe(recommendation.score - 1);
  });
  it("Should answer with status 404 when give a invalid id", async () => {
    const response = await agent.post(`/recommendations/5/downvote`).send({});
    expect(response.status).toBe(404);
  });
  it("Should delete whe recommendation when the score is lower than -5", async () => {
    const recommendation = await createRecommendation(true);
    for (let i = 0; i <= 5; i++) {
      await agent.post(`/recommendations/${recommendation.id}/downvote`).send({});
    }
    const recommendationCreated = await prisma.recommendation.findUnique({
      where: { id: recommendation.id },
    });
    expect(recommendationCreated).toBeNull();
  });
});

describe("GET /recommendations", () => {
  it("Should answer with status 200 and response an array of recommendations", async () => {
    for (let i = 0; i < 12; i++) {
      await createRecommendation();
    }
    const response = await agent.get("/recommendations");
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
    expect(response.body.length).toEqual(10);
  });
});

describe("GET /recommendations/:id", () => {
  it("Should answer with status 200 and response a recommendation", async () => {
    const recommendation = await createRecommendation();
    const response = await agent.get(`/recommendations/${recommendation.id}`);
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
  });
  it("Should answer with status 404 when give a inexistent id", async () => {
    const response = await agent.get(`/recommendations/${faker.random.numeric()}`);
    expect(response.status).toBe(404);
  });
});
describe("GET /recommendations/random", () => {
  it("Should answer with status 404 when database is empty", async () => {
    const response = await agent.get("/recommendations/random");
    expect(response.status).toBe(404);
  });
});
describe("GET /recommendations/top/:amount", () => {
  it("Should answer with status 200 and response a recommendation array", async () => {
    for (let i = 0; i < 12; i++) {
      await createRecommendation();
    }
    const response = await agent.get("/recommendations/top/10");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
