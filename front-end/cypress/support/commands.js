Cypress.Commands.add("resetRecommendation", () => {
  cy.log("Reseting Data");
  cy.request("POST", "http://localhost:5000/reset-recommendations").then((res) => {
    cy.log(res);
  });
});

Cypress.Commands.add("createRecommendation", (recommendation) => {
  cy.log("Creating Recommendation");
  cy.request("POST", "http://localhost:5000/recommendations", recommendation).then((res) => {
    cy.log(res.status);
  });
});
