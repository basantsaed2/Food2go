import { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { Table } from '@/components/ui/table';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // 1. استيراد useNavigate

const OrderOnline = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // 2. تعريف التنقل

    // حالة الفلتر - الديفولت 'orders' لعرض الكل
    const [statusFilter, setStatusFilter] = useState('orders');

    // جلب البيانات من الـ API
    const { data, isLoading, isError, error } = useGet({
        url: `${apiUrl}/branch/online_order`,
        queryKey: [QUERY_KEYS.ORDERS],
        pollInterval: 30000, // تحديث تلقائي كل 30 ثانية
    });

    // 3. دالة التوجيه لصفحة التفاصيل
    const handleViewOrder = (order) => {
        // تأكد من أن المسار يطابق ما هو معرف في AppRoutes
        navigate(`/orders/details/${order.id}`);
    };

    // تحويل البيانات لشكل مناسب للجدول (Formatting)
    const filteredData = data?.[statusFilter]?.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.user ? `${order.user.f_name} ${order.user.l_name}` : 'Unknown',
        customerPhone: order.user?.phone || '—',
        amount: order.amount,
        paymentMethod: order.payment_method?.name || 'cash',
        orderStatus: order.order_status,
        branch: order.branch?.name || '—',
        createdAt: new Date(order.created_at).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
    })) || [];

    // تعريف أعمدة الجدول
    const orderColumns = [
        {
            key: 'orderNumber',
            label: 'Order ID',
            renderCell: (item) => (
                <span className="text-blue-600 font-bold hover:underline">
                    #{item.orderNumber}
                </span>
            )
        },
        { key: 'customerName', label: 'Customer' },
        { key: 'customerPhone', label: 'Phone' },
        {
            key: 'amount',
            label: 'Amount',
            renderCell: (item) => <span className="font-bold">{item.amount} EGP</span>
        },
        { key: 'paymentMethod', label: 'Payment' },
        { key: 'createdAt', label: 'Date' },
        {
            key: 'orderStatus',
            label: 'Status',
            renderCell: (item) => {
                const statusColors = {
                    pending: 'bg-yellow-500',
                    confirmed: 'bg-blue-500',
                    processing: 'bg-indigo-500',
                    delivered: 'bg-green-500',
                    canceled: 'bg-red-500',
                    faild_to_deliver: 'bg-red-700',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-white text-[10px] font-semibold uppercase ${statusColors[item.orderStatus] || 'bg-gray-400'}`}>
                        {item.orderStatus}
                    </span>
                );
            }
        },
    ];

    const tabs = [
        { id: 'orders', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'processing', label: 'Processing' },
        { id: 'out_for_delivery', label: 'Out for Delivery' },
        { id: 'delivered', label: 'Delivered' },
        { id: 'canceled', label: 'Canceled' },
    ];

    if (isError) {
        return (
            <div className="p-10 text-center text-red-500">
                <p>Error: {error?.message || 'Something went wrong'}</p>
                <button
                    onClick={() => queryClient.invalidateQueries([QUERY_KEYS.ORDERS])}
                    className="mt-4 px-4 py-2 bg-bg-primary text-white rounded-md"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-bg-primary">Online Orders</h2>
                <span className="text-sm text-gray-500 italic">Auto-refreshing every 30s</span>
            </div>

            {/* أزرار الفلترة (Tabs) */}
            <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative
                            ${statusFilter === tab.id
                                ? 'bg-bg-primary text-white shadow-md'
                                : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                    >
                        {tab.label}
                        {data?.[tab.id]?.length > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === tab.id ? 'bg-white text-bg-primary' : 'bg-gray-200 text-gray-800'}`}>
                                {data?.[tab.id]?.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* عرض اللودر أو الجدول */}
            {isLoading ? (
                <FullPageLoader />
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table
                        data={filteredData}
                        columns={orderColumns}
                        className="w-full"
                        actionsButtons={false}
                        onView={handleViewOrder}   // تفعيل زر العين
                        onRowClick={handleViewOrder} // تفعيل الضغط على الصف بالكامل
                    />
                </div>
            )}
        </div>
    );
};

export default OrderOnline;