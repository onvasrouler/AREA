import { expect } from "chai";
import sinon from "sinon";
import { ApiClient, getApiClient } from "../src/common/client/APIClient.js"; // Remplacez par le chemin correct
import { JSDOM } from "jsdom";

describe("ApiClient", () => {
  let apiClient;
  let fetchStub;

  before(() => {
    const dom = new JSDOM("", { url: "https://example.com" });
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;
  });


  beforeEach(() => {
    apiClient = new ApiClient("https://example.com");
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

  describe("request", () => {
    it("should call fetch with the correct URL and options", async () => {
      fetchStub.resolves(new Response(JSON.stringify({ success: true }), { status: 200 }));

      const response = await apiClient.request("test-endpoint", "GET");

      expect(fetchStub.calledOnce).to.be.true;
      const fetchArgs = fetchStub.firstCall.args;
      expect(fetchArgs[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchArgs[1].method).to.equal("GET");
      expect(response.ok).to.be.true;
    });

    it("should throw an error with status and message when response is not ok", async () => {
      const errorResponse = { message: "Not Found" };
      fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 404 }));

      try {
        await apiClient.request("test-endpoint", "GET");
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal("Not Found");
      }
    });

    it("should handle unexpected errors gracefully", async () => {
      fetchStub.rejects(new Error("Network error"));

      try {
        await apiClient.request("test-endpoint", "GET");
      } catch (error) {
        expect(error.status).to.equal(500);
        expect(error.message).to.equal("An unexpected error occurred");
      }
    });
  });

  describe("HTTP methods", () => {
    it("should make a GET request", async () => {
      fetchStub.resolves(new Response(JSON.stringify({ success: true }), { status: 200 }));

      const response = await apiClient.get("test-endpoint");
      expect(fetchStub.calledOnce).to.be.true;
      const options = fetchStub.firstCall.args[1];
      expect(options.method).to.equal("GET");
    });

    it("should make a POST request with a body", async () => {
      fetchStub.resolves(new Response(JSON.stringify({ success: true }), { status: 201 }));

      const body = { key: "value" };
      const response = await apiClient.post("test-endpoint", body);
      expect(fetchStub.calledOnce).to.be.true;
      const options = fetchStub.firstCall.args[1];
      expect(options.method).to.equal("POST");
      expect(options.body).to.equal(JSON.stringify(body));
    });

    it("should make a PUT request with a body", async () => {
      fetchStub.resolves(new Response(JSON.stringify({ success: true }), { status: 200 }));

      const body = { key: "value" };
      const response = await apiClient.put("test-endpoint", body);
      expect(fetchStub.calledOnce).to.be.true;
      const options = fetchStub.firstCall.args[1];
      expect(options.method).to.equal("PUT");
      expect(options.body).to.equal(JSON.stringify(body));
    });

    it("should make a DELETE request", async () => {
      fetchStub.resolves(new Response(null, { status: 204 }));

      await apiClient.delete("test-endpoint");
      expect(fetchStub.calledOnce).to.be.true;
      const options = fetchStub.firstCall.args[1];
      expect(options.method).to.equal("DELETE");
    });

    it("should make a PATCH request with a body", async () => {
      fetchStub.resolves(new Response(JSON.stringify({ success: true }), { status: 200 }));

      const body = { key: "value" };
      const response = await apiClient.patch("test-endpoint", body);
      expect(fetchStub.calledOnce).to.be.true;
      const options = fetchStub.firstCall.args[1];
      expect(options.method).to.equal("PATCH");
      expect(options.body).to.equal(JSON.stringify(body));
    });
  });

  describe("getApiClient", () => {
    it("should return an ApiClient instance with a token if it exists in localStorage", () => {
      sinon.stub(localStorage, "getItem").returns("test-token");

      const client = getApiClient();
      expect(client).to.be.instanceOf(ApiClient);
      expect(client.accessToken).to.equal("test-token");

      localStorage.getItem.restore();
    });

    it("should return an ApiClient instance without a token if localStorage is empty", () => {
      sinon.stub(localStorage, "getItem").returns(null);

      const client = getApiClient();
      expect(client).to.be.instanceOf(ApiClient);
      expect(client.accessToken).to.be.null;

      localStorage.getItem.restore();
    });
  });
});
