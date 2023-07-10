import { execSync } from "node:child_process";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("should to able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 5000,
      type: "credit",
    });

    const cookies = createTransactionResponse.get("set-cookie");

    const listTransactionResponse = await request(app.server)
      .get("/transactions")
      .set("cookie", cookies)
      .expect(200);

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    ]);
  });

  it("should to able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 5000,
      type: "credit",
    });

    const cookies = createTransactionResponse.get("set-cookie");

    const listTransactionResponse = await request(app.server)
      .get("/transactions")
      .set("cookie", cookies)
      .expect(200);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    );
  });
});
