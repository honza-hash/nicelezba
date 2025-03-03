import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async <T>(
  method: string = "GET",
  url: string,
  data?: any,
): Promise<T> => {
  const options: RequestInit = {
    method,
    credentials: 'include', // This ensures cookies are sent with requests
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      // Only try to parse as JSON if the content type includes 'json'
      if (contentType && contentType.includes("application/json")) {
        const errorJson = await response.json();
        errorMessage = errorJson.message || JSON.stringify(errorJson);
      } else {
        errorMessage = await response.text();
        // If it starts with HTML, use a more user-friendly message
        if (errorMessage.startsWith('<!DOCTYPE') || errorMessage.startsWith('<html')) {
          errorMessage = `Server error (${response.status})`;
        }
      }
    } catch (e) {
      errorMessage = `Failed to parse error response (${response.status})`;
    }
    throw new Error(errorMessage);
  }
  
  // Only try to parse as JSON if the content type includes 'json'
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  throw new Error("Response is not JSON");
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000, // 1 minuta
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});