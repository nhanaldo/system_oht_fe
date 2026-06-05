import { useState, useEffect, useCallback, useRef } from 'react';

// A simple global registry to support query invalidation across components
//Đây là một Custom Hook thay thế cho React Query (TanStack Query). 
// Nó tự xây dựng lại các tính năng cốt lõi mà không cần cài thêm thư viện bên ngoài.
type RefetchFn = () => void;
const queryRegistry = new Map<string, Set<RefetchFn>>();

export const useQueryClient = () => {
    const invalidateQueries = useCallback(({ queryKey }: { queryKey: any[] | string }) => {
        const keyStr = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        if (keyStr) {
            const listeners = queryRegistry.get(String(keyStr));
            if (listeners) {
                listeners.forEach(refetch => refetch());
            }
        }
    }, []);

    return { invalidateQueries };
};

interface UseTableQueryProps<T = any> {
    queryKey: string;
    fetchFn: (params: any) => Promise<any>;
    initialParams?: {
        search?: string;
        page?: number;
        limit?: number;
        [key: string]: any;
    };
}

export function useTableQuery<T = any>({
    queryKey,
    fetchFn,
    initialParams = {}
}: UseTableQueryProps<T>) {
    const [params, setParams] = useState({
        search: "",
        status: "",
        page: 1,
        limit: 20,
        ...initialParams
    });

    const [data, setData] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRef = useRef(fetchFn);
    fetchRef.current = fetchFn;

    const loadData = useCallback(async (currentParams: typeof params) => {
        setIsLoading(true);
        try {
            const res = await fetchRef.current(currentParams);

            // Extract elements/rows/data
            const elements = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
            setData(elements);

            // Extract total count
            const totalCount = res?.total ?? res?.total_elements ?? res?.count ?? (Array.isArray(res) ? res.length : 0);
            setTotal(totalCount);
        } catch (error) {
            console.error(`[useTableQuery] Error fetching ${queryKey}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [queryKey]);

    // Initial fetch and fetch on params change
    useEffect(() => {
        loadData(params);
    }, [params, loadData]);

    // Invalidation subscriber
    useEffect(() => {
        const listeners = queryRegistry.get(queryKey) || new Set<RefetchFn>();
        const refetch = () => {
            loadData(params);
        };
        listeners.add(refetch);
        queryRegistry.set(queryKey, listeners);

        return () => {
            const currentListeners = queryRegistry.get(queryKey);
            if (currentListeners) {
                currentListeners.delete(refetch);
                if (currentListeners.size === 0) {
                    queryRegistry.delete(queryKey);
                }
            }
        };
    }, [queryKey, params, loadData]);

    const onPageChange = useCallback((page: number, pageSize?: number) => {
        setParams(prev => ({
            ...prev,
            page,
            limit: pageSize || prev.limit
        }));
    }, []);

    const onSearchChange = useCallback((search: string) => {
        setParams(prev => ({
            ...prev,
            search,
            page: 1 // reset to first page on search
        }));
    }, []);

    return {
        params,
        setParams,
        onPageChange,
        onSearchChange,
        data,
        total,
        isLoading,
        refetch: () => loadData(params)
    };
}
