const createServer = require("./server");
const supertest = require("supertest");
/**
 * Connect to the in-memory database.
 */
jest.setTimeout(40000);
describe("API routes /api", () => {
  const app = createServer();

  test("POST /api/figma except a valid editframe response", async () => {
    const data = {
      fileId: "OvDi0eMar0DiAJ1kpQkp2n",
      nodeId: "115%3A5",
    };
    await supertest(app).post(`/api/figma`).send(data).expect(200);
  });
  test("POST /api/figma send null node id except a error message", async () => {
    const data = {
      fileId: "OvDi0eMar0DiAJ1kpQkp2n",
      nodeId: "",
    };
    await supertest(app).post(`/api/figma`).send(data).expect(500);
  });
});
