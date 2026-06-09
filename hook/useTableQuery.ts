import { useState, useEffect, useCallback, useRef } from 'react';

// A simple global registry to support query invalidation across components
//Đây là một Custom Hook thay thế cho React Query (TanStack Query). 
// Nó tự xây dựng lại các tính năng cốt lõi mà không cần cài thêm thư viện bên ngoài.
type RefetchFn = () => void;
const queryRegistry = new Map<string, Set<RefetchFn>>();

//Nhiệm vụ duy nhất của nó là cung cấp hàm invalidateQueries (làm mất hiệu lực/làm mới truy vấn) 
// - một tính năng được "copy" lại từ thư viện React Query.
export const useQueryClient = () => {
    const invalidateQueries = useCallback(({ queryKey }: { queryKey: any[] | string }) => { //    cho phép truyền query dưới dạng 1 chuỗi hoặc 1 mảng 
        const keyStr = Array.isArray(queryKey) ? queryKey[0] : queryKey; // lấy phần tử đầu tiên của mảng
        if (keyStr) { // nếu keyStr không rỗng
            const listeners = queryRegistry.get(String(keyStr)); // lấy các refetch function đã đăng ký
            if (listeners) { // nếu có refetch function
                listeners.forEach(refetch => refetch()); // thực thi tất cả refetch function
            }
        }
    }, []);

    return { invalidateQueries };
};

// Định nghĩa Props cho Custom Hook này
interface UseTableQueryProps<T = any> {
    queryKey: string; // ID duy nhất của truy vấn, dùng để quản lý cache và invalidation.
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
    // Khởi tạo State quản lý tham số truy vấn (Params)
    const [params, setParams] = useState({
        search: "",
        status: "",
        page: 1, // page là gửi đi và total là nhận về - có nghĩa là mình gửi đi là yêu cầu muốn lấy ở trang số 1 và server trả về tổng số bản ghi là 100
        limit: 20,
        ...initialParams
    });
    // Khởi tạo State lưu trữ dữ liệu trả về
    const [data, setData] = useState<T[]>([]);
    // Khởi tạo State lưu trữ tổng số bản ghi (dùng cho phân trang)
    const [total, setTotal] = useState(0);
    // Khởi tạo State theo dõi trạng thái tải dữ liệu (isLoading)
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

    useEffect(() => {
        const listeners = queryRegistry.get(queryKey) || new Set<RefetchFn>();
        const refetch = () => {
            loadData(params);
        };
        listeners.add(refetch);
        queryRegistry.set(queryKey, listeners);
        //Dọn dẹp (Cleanup) khi Component bị hủy  Tránh rò rỉ bộ nhớ (memory leak)
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

    // Hàm xử lý chuyển trang , khi chuyển trang thì giúp lấy thông số trang 
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
            page: 1
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
