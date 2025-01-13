import { expect } from "chai";
import sinon from "sinon";
import { ApiClient, getApiClient } from "../src/common/client/APIClient.js"; // Remplacez par le chemin correct
import { JSDOM } from "jsdom";

describe("ApiClient", () => {
  let apiClient;
  let fetchStub;

  before(() => {
    const dom = new JSDOM("", { url: "https://example.com" });
    process.env.VITE_BACKEND_URL = "https://example.com/";
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;
  });

  beforeEach(() => {
    apiClient = new ApiClient(process.env.VITE_BACKEND_URL);
    fetchStub = sinon.stub(global, "fetch");
  });

  afterEach(() => {
    fetchStub.restore();
  });

  describe("constructor", () => {
    it("should initialize with a base URL", () => {
      expect(apiClient.baseURL).to.equal("https://example.com/");
    });

    it("should add a trailing slash to the base URL if missing", () => {
      const client = new ApiClient("https://example.com");
      expect(client.baseURL).to.equal("https://example.com/");
    });
  });

  describe("setAccessToken", () => {
    it("should set the access token", () => {
      apiClient.setAccessToken("test-token");
      expect(apiClient.accessToken).to.equal("test-token");
    });
  });

  describe("getHeaders", () => {
    it("should return default headers with Content-Type set to JSON", () => {
      const headers = apiClient.getHeaders();
      expect(headers).to.have.property("Content-Type", "application/json");
    });

    it("should include the Authorization header if an access token is set", () => {
      apiClient.setAccessToken("test-token");
      const headers = apiClient.getHeaders();
      expect(headers).to.have.property("Authorization", "Bearer test-token");
    });

    it("should not include Content-Type for form data", () => {
      const headers = apiClient.getHeaders({}, true);
      expect(headers).to.not.have.property("Content-Type");
    });
  });

  describe("get", () => {
    it("should make a GET request", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.get("test-endpoint");
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchStub.firstCall.args[1].method).to.equal("GET");
    });
  });
});
