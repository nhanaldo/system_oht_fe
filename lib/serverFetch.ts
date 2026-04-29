interface ServerFetchOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function serverFetch<T = any>(
    endpoint: string,
    options: ServerFetchOptions = {}
): Promise<T> {
    const baseUrl = process.env.API_BASE_INTERNAL;

    if (!baseUrl) {
        throw new Error('API_BASE_INTERNAL is not defined in environment variables (.env.local)');
    }

    // Format url to avoid double slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const formattedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    let url = `${formattedBase}${normalizedEndpoint}`;

    // Attach search parameters if provided
    if (options.params) {
        const searchParams = new URLSearchParams(options.params);
        url += `?${searchParams.toString()}`;
    }

    const { params, ...fetchOptions } = options;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const finalOptions: RequestInit = {
        ...fetchOptions,
        headers: {
            ...defaultHeaders,
            ...fetchOptions.headers,
        },
    };

    try {
        const response = await fetch(url, finalOptions);

        // Handle 204 No Content
        if (response.status === 204) {
            return null as unknown as T;
        }
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // Handle non-2xx HTTP responses
        if (!response.ok) {
            const errorData = isJson ? await response.json() : await response.text();
            throw {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
                url,
            };
        }

        // Return parsed JSON or plain text based on content-type
        if (isJson) {
            return (await response.json()) as T;
        }

        return (await response.text()) as unknown as T;
    } catch (error) {
        console.error(`[serverFetch] Error calling ${url}:`, error);
        throw error;
    }
}
