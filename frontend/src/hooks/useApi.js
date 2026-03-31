import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';

export const useApi = (endpoint, options = {}, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (dynamicEndpoint = endpoint, dynamicOptions = options) => {
      setLoading(true);
      setError(null);
      
      const method = (dynamicOptions.method || 'GET').toLowerCase();
      const body = dynamicOptions.body ? JSON.parse(dynamicOptions.body) : undefined;

      try {
        let result;
        switch (method) {
          case 'post':
            result = await apiClient.post(dynamicEndpoint, body);
            break;
          case 'put':
            result = await apiClient.put(dynamicEndpoint, body);
            break;
          case 'delete':
            result = await apiClient.delete(dynamicEndpoint);
            break;
          default: // GET
            result = await apiClient.get(dynamicEndpoint);
            break;
        }
        setData(result);
        return { data: result, error: null };
      } catch (err) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, JSON.stringify(options)]
  );

  return { data, loading, error, execute, setData };
};
