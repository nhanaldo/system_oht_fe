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
            let errorMessage = `HTTP ${response.status} ${response.statusText}`;

            // Lấy message từ backend nếu có
            if (isJson && errorData && typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (isJson && errorData && typeof errorData.error === 'string') {
                errorMessage = errorData.error;
            }

            const error = new Error(errorMessage);
            (error as any).status = response.status;
            (error as any).data = errorData;
            (error as any).url = url;
            throw error;
        }

        // Return parsed JSON or plain text based on content-type
        if (isJson) {
            return (await response.json()) as T;
        }

        return (await response.text()) as unknown as T;
    } catch (error: any) {
        if (error instanceof Error) {
            console.error(`[serverFetch] Error calling ${url}: ${error.message}`);
        } else {
            console.error(`[serverFetch] Error calling ${url}:`, error);
        }
        throw error;
    }
}
