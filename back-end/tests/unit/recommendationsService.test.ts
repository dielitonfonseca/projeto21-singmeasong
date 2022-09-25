import { recommendationService, CreateRecommendationData } from "./../../src/services/recommendationsService.js";
import { recommendationRepository } from "./../../src/repositories/recommendationRepository.js";
import { jest } from "@jest/globals";

jest.mock("./../../src/services/recommendationsService");

describe("recommendationService test suite", () => {
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

  it("Should upvote a recommendation", async () => {
    const id = 1;
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return {
        id,
        name: "nome qlqr",
        youtubeLink: "youtube.com/asdasdas",
        score: 1,
      };
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});

    await recommendationService.upvote(id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("With an invalid id, should call an error", async () => {
    const id = 1;
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {});

    const promise = recommendationService.upvote(id);
    expect(promise).rejects.toEqual({ message: "", type: "not_found" });
  });
});
