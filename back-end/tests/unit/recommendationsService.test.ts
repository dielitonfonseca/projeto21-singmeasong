import { recommendationService, CreateRecommendationData } from "./../../src/services/recommendationsService.js";
import { recommendationRepository } from "./../../src/repositories/recommendationRepository.js";
import { jest } from "@jest/globals";
import { notFoundError } from "../../src/utils/errorUtils.js";
import { validRecommendation } from "../factories/recommendationFactory.js";

jest.mock("./../../src/services/recommendationsService");

describe("Insert Recommendation test suite", () => {
  it("Should creat recommendation", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {});
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => {});
    await recommendationService.insert({ name: "Musica qualquer", youtubeLink: "https://www.youtube.com/watch?v=r9buAwVBDhA" });
    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
  });

  it("Should not create a duplicate name", async () => {
    const recommendation = { name: "Musica qualquer", youtubeLink: "https://www.youtube.com/watch?v=r9buAwVBDhA" };
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {
      return {
        name: recommendation.name,
        youtubeLink: recommendation.youtubeLink,
      };
    });
    const promise = recommendationService.insert(recommendation);
    expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique" });
  });
});

describe("Upvote Recommendation test suite", () => {
  it("Should upvote a recommendation", async () => {
    const id = 1;
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return { id, ...validRecommendation() };
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});

    await recommendationService.upvote(id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("On try of upvote with an invalid id, should call an error", async () => {
    const id = 1;
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {});

    const promise = recommendationService.upvote(id);
    expect(promise).rejects.toEqual(notFoundError());
  });
});
describe("Downvote Recommendation test suite", () => {
  it("Should downvote a recommendation", async () => {
    const id = 1;
    const recommendation = { id, ...validRecommendation() };
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return recommendation;
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
      return { ...recommendation, score: recommendation.score - 1 };
    });

    await recommendationService.downvote(id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("On downvote try with an invalid id, should call an error", async () => {
    const id = 1;
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {});
    const promise = recommendationService.downvote(id);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it("On downvote with -5 score, should delete the recommendation", async () => {
    const id = 1;
    const recommendation = { id, ...validRecommendation(-5) };
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return recommendation;
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
      return { ...recommendation, score: recommendation.score - 1 };
    });
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {});
    await recommendationService.downvote(id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
  });
});

describe("Get Recommendations Test Suite", () => {
  it("Should get a recommendation", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {});
    await recommendationService.get();
    expect(recommendationRepository.find).toBeCalled();
  });

  it("Should get top recommendations", async () => {
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => {});
    await recommendationService.getTop(10);
    expect(recommendationRepository.getAmountByScore).toBeCalled();
  });

  it("Should getRandom recommendation with differents percentages and greater than 10", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce((): any => {
      return 0.8;
    });
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
      return [
        { id: 1, ...validRecommendation(50) },
        { id: 2, ...validRecommendation() },
        { id: 3, ...validRecommendation() },
      ];
    });
    const recommendation = await recommendationService.getRandom();
    expect(recommendationRepository.findAll).toHaveBeenCalled();
    expect(recommendation).not.toBeNull;
    expect(recommendation).not.toBeUndefined;
  });
  it("Should getRandom recommendation with differents percentages and less than or equal to 10", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce((): any => {
      return 0.5;
    });
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
      return [
        { id: 1, ...validRecommendation(50) },
        { id: 2, ...validRecommendation() },
        { id: 3, ...validRecommendation() },
      ];
    });
    const recommendation = await recommendationService.getRandom();
    expect(recommendationRepository.findAll).toHaveBeenCalled();
    expect(recommendation).not.toBeNull;
    expect(recommendation).not.toBeUndefined;
  });

  it("Don't have recommendations, should give an error", () => {
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
      return [];
    });
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
      return [];
    });
    const promise = recommendationService.getRandom();
    expect(recommendationRepository.findAll).toHaveBeenCalled();
    expect(promise).rejects.toEqual(notFoundError());
  });
});
