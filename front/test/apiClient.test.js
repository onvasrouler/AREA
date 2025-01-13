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

    it("should include headers", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.get("test-endpoint", { "X-Test-Header": "test" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("X-Test-Header", "test");
    });

    it("should throw an error if the response is not OK", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({ message: "Test error" }) });
      try {
        await apiClient.get("test-endpoint");
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "Test error" });
      }
    });
  });

  describe("post", () => {
    it("should make a POST request", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.post("test-endpoint", { test: "data" });
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchStub.firstCall.args[1].method).to.equal("POST");
      expect(fetchStub.firstCall.args[1].body).to.equal('{"test":"data"}');
    });

    it("should include headers", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.post("test-endpoint", { test: "data" }, { "X-Test-Header": "test" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("X-Test-Header", "test");
    });

    it("should include form data", async () => {
      fetchStub.resolves({ ok: true });
      const formData = new FormData();
      formData.append("key", "value");
      await apiClient.post("test-endpoint", formData, {}, true);
      expect(fetchStub.firstCall.args[1].body).to.equal(formData);
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.be.undefined;
    });

    it("should throw an error if the response is not OK", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({ message: "Test error" }) });
      try {
        await apiClient.post("test-endpoint", { test: "data" });
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "Test error" });
      }
    });

    it("should handle missing body gracefully", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.post("test-endpoint", undefined);
      expect(fetchStub.firstCall.args[1].body).to.be.undefined;
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.equal("application/json");
    });

    it("should include access token if set", async () => {
      apiClient.setAccessToken("test-token");
      fetchStub.resolves({ ok: true });
      await apiClient.post("test-endpoint", { test: "data" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("Authorization", "Bearer test-token");
    });

    it("should handle server errors with no message", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({}) });
      try {
        await apiClient.post("test-endpoint", { test: "data" });
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "An error occurred" });
      }
    });
  });

  describe("put", () => {
    it("should make a PUT request", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.put("test-endpoint", { test: "data" });
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchStub.firstCall.args[1].method).to.equal("PUT");
      expect(fetchStub.firstCall.args[1].body).to.equal('{"test":"data"}');
    });

    it("should include headers", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.put("test-endpoint", { test: "data" }, { "X-Test-Header": "test" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("X-Test-Header", "test");
    });

    it("should include form data", async () => {
      fetchStub.resolves({ ok: true });
      const formData = new FormData();
      formData.append("key", "value");
      await apiClient.put("test-endpoint", formData, {}, true);
      expect(fetchStub.firstCall.args[1].body).to.equal(formData);
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.be.undefined;
    });

    it("should throw an error if the response is not OK", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({ message: "Test error" }) });
      try {
        await apiClient.put("test-endpoint", { test: "data" });
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "Test error" });
      }
    });

    it("should handle missing body gracefully", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.put("test-endpoint", undefined);
      expect(fetchStub.firstCall.args[1].body).to.be.undefined;
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.equal("application/json");
    });

    it("should include access token if set", async () => {
      apiClient.setAccessToken("test-token");
      fetchStub.resolves({ ok: true });
      await apiClient.put("test-endpoint", { test: "data" });
      expect
      (fetchStub.firstCall.args[1].headers).to.have.property("Authorization", "Bearer test-token");
    });
  });

  describe("delete", () => {
    it("should make a DELETE request", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.delete("test-endpoint");
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchStub.firstCall.args[1].method).to.equal("DELETE");
    });

    it("should include headers", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.delete("test-endpoint", { "X-Test-Header": "test" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("X-Test-Header", "test");
    });

    it("should throw an error if the response is not OK", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({ message: "Test error" }) });
      try {
        await apiClient.delete("test-endpoint");
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "Test error" });
      }
    });

    it("should include access token if set", async () => {
      apiClient.setAccessToken("test-token");
      fetchStub.resolves({ ok: true });
      await apiClient.delete("test-endpoint");
      expect(fetchStub.firstCall.args[1].headers).to.have.property("Authorization", "Bearer test-token");
    });

    it("should handle server errors with no message", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({}) });
      try {
        await apiClient.delete("test-endpoint");
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "An error occurred" });
      }
    });

    it("should handle missing body gracefully", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.delete("test-endpoint");
      expect(fetchStub.firstCall.args[1].body).to.be.undefined;
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.equal("application/json");
    });
  });

  describe("patch", () => {
    it("should make a PATCH request", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.patch("test-endpoint", { test: "data" });
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal("https://example.com/test-endpoint");
      expect(fetchStub.firstCall.args[1].method).to.equal("PATCH");
      expect(fetchStub.firstCall.args[1].body).to.equal('{"test":"data"}');
    });

    it("should include headers", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.patch("test-endpoint", { test: "data" }, { "X-Test-Header": "test" });
      expect(fetchStub.firstCall.args[1].headers).to.have.property("X-Test-Header", "test");
    });

    it("should include form data", async () => {
      fetchStub.resolves({ ok: true });
      const formData = new FormData();
      formData.append("key", "value");
      await apiClient.patch("test-endpoint", formData, {}, true);
      expect(fetchStub.firstCall.args[1].body).to.equal(formData);
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.be.undefined;
    });

    it("should throw an error if the response is not OK", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({ message: "Test error" }) });
      try {
        await apiClient.patch("test-endpoint", { test: "data" });
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "Test error" });
      }
    });

    it("should handle missing body gracefully", async () => {
      fetchStub.resolves({ ok: true });
      await apiClient.patch("test-endpoint", undefined);
      expect(fetchStub.firstCall.args[1].body).to.be.undefined;
      expect(fetchStub.firstCall.args[1].headers["Content-Type"]).to.equal("application/json");
    });

    it("should handle server errors with no message", async () => {
      fetchStub.resolves({ ok: false, json: () => Promise.resolve({}) });
      try {
        await apiClient.patch("test-endpoint", { test: "data" });
      } catch (error) {
        expect(error).to.deep.equal({ status: 500, message: "An error occurred" });
      }
    });
  });
});
