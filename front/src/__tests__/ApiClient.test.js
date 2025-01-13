import { jest } from '@jest/globals';
import { getApiClient } from './__mocks__/APIClientMock';

global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('ApiClient', () => {
    let apiClient;

    beforeEach(() => {
      apiClient = getApiClient();
      fetch.mockClear();
    });

    test('initializes baseURL correctly', () => {
      const client = new apiClient.constructor('http://example.com');
      expect(client.baseURL).toBe('http://example.com/');
    });

    test('setAccessToken sets the token correctly', () => {
      apiClient.setAccessToken('my-token');
      expect(apiClient.accessToken).toBe('my-token');
    });

    test('getHeaders generates default headers', () => {
        const headers = apiClient.getHeaders();
        expect(headers).toEqual({
          'Content-Type': 'application/json',
        });
      });

    test('getHeaders includes Authorization if accessToken is set', () => {
      apiClient.setAccessToken('my-token');
      const headers = apiClient.getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer my-token',
      });
    });

    test('getHeaders does not set Content-Type for form data', () => {
      const headers = apiClient.getHeaders({}, true);
      expect(headers).toEqual({});
    });

    test('request sends a GET request successfully', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
    });
    const response = await apiClient.request('test-endpoint');
    expect(fetch).toHaveBeenCalledWith(
      `${apiClient.baseURL}test-endpoint`,
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const jsonResponse = await response.json();
        expect(jsonResponse.data).toBe('success');
    });

    test('request throws an error if response is not ok', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not found' }),
        });
        await expect(apiClient.request('invalid-endpoint')).rejects.toEqual({
          status: 404,
          message: 'Not found',
        });
    });

    test('get calls request with GET method', async () => {
        const spy = jest.spyOn(apiClient, 'request').mockResolvedValueOnce({});
        await apiClient.get('test-endpoint');
        expect(spy).toHaveBeenCalledWith('test-endpoint', 'GET', undefined, undefined);
    });

    test('post calls request with POST method and body', async () => {
        const spy = jest.spyOn(apiClient, 'request').mockResolvedValueOnce({});
        const body = { key: 'value' };
        await apiClient.post('test-endpoint', body);
        expect(spy).toHaveBeenCalledWith('test-endpoint', 'POST', body, undefined, false);
    });
});
