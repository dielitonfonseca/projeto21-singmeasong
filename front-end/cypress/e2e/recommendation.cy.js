/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000";

beforeEach(() => {
  cy.resetRecommendation();
});

describe("Create Recommendantion Test", () => {
  const recommendation = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=6t_dYhXyYjI",
  };

  it("should create recommendation", () => {
    cy.visit(`${URL}/`);
    cy.get('[placeholder*="Name"]').type(recommendation.name);
    cy.get('[placeholder*="https://youtu.be/..."]').type(recommendation.youtubeLink);
    cy.intercept("POST", "/recommendations").as("recommendation");
    cy.get("#createButtom").click();
    cy.wait("@recommendation");
    cy.contains(`${recommendation.name}`).should("exist");
  });
});

describe("Navigate Through Menu Pages", () => {
  const recommendation = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=aBkTkxKDduc",
  };

  beforeEach(() => {
    cy.createRecommendation(recommendation);
  });

  it("Should navigate to top", () => {
    cy.visit(`${URL}/`);
    cy.contains("Top").click();
    cy.contains(`${recommendation.name}`).should("exist");
    cy.url().should("equal", `${URL}/top`);
  });

  it("should navigate to random", () => {
    cy.visit(`${URL}/`);
    cy.contains("Random").click();
    cy.contains(`${recommendation.name}`).should("exist");
    cy.url().should("equal", `${URL}/random`);
  });

  it("should navigate to home", () => {
    cy.visit(`${URL}/`);

    cy.contains("Home").click();

    cy.contains(`${recommendation.name}`).should("exist");
    cy.url().should("equal", `${URL}/`);
  });
});

describe("Create Downvote/Upvore Test Suite ", () => {
  const recommendation = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=aBkTkxKDduc",
  };

  beforeEach(() => {
    cy.createRecommendation(recommendation);
  });

  it("Should increase upvote number on click", () => {
    cy.visit(`${URL}/`);
    cy.get("#upvote").click();
    cy.get("#score").should("contain", `1`);
  });

  it("should increase downvote number on click", () => {
    cy.visit(`${URL}/`);
    cy.get("#downvote").click();
    cy.get("#score").should("contain", `-1`);
  });
});
