import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGet } from "@/Hooks/useGet";
import { usePost } from "@/Hooks/UsePost";
import { useChangeState } from "@/Hooks/useChangeState";
import FullPageLoader from "@/components/Loading";
import { FaUser, FaClock, FaHashtag, FaMoneyBillWave, FaMapMarkerAlt, FaFileInvoice } from "react-icons/fa";
import { QUERY_KEYS } from "@/constants/queryKeys";

const OrderDetails = () => {
    const { orderId } = useParams(); // تأكد أن الراوت معرف بـ :orderId
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // 1. جلب بيانات تفاصيل الطلب
    // ملاحظة: استخدمنا orderId مباشرة في الـ URL كما هو متبع في الـ Structure الخاص بك
    const { data: responseData, isLoading, refetch } = useGet({
        url: `${apiUrl}/branch/online_order/order/${orderId}`,
        queryKey: [QUERY_KEYS.ORDERS, orderId],
    });

    const order = responseData?.order;
    const orderDetails = responseData?.order_details || [];
    const orderStatuses = responseData?.order_status || [];

    // 2. Hook تغيير الحالة
    const { changeState, loadingChange } = useChangeState();

    const handleStatusChange = async (newStatus) => {
        const statusUrl = `${apiUrl}/branch/online_order/status/${orderId}`;
        const success = await changeState(statusUrl, "Status updated successfully", {
            order_status: newStatus
        });
        if (success) refetch();
    };

    if (isLoading) return <FullPageLoader />;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-bg-primary flex items-center gap-2">
                        <FaHashtag /> Order #{order.order_number}
                    </h2>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <FaClock /> {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/orders/invoice/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                    >
                        <FaFileInvoice /> View Invoice
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Items & Progress */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Table */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">Order Items ({orderDetails.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Qty</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orderDetails.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.product?.name || "Product"}</div>
                                                {item.variations?.length > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        {item.variations.map(v => v.name).join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{item.quantity}</td>
                                            <td className="px-6 py-4">{item.price} EGP</td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                {(item.price * item.quantity).toFixed(2)} EGP
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Summary */}
                        <div className="p-6 bg-gray-50 border-t space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{order.amount} EGP</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-bg-primary pt-2 border-t">
                                <span>Total Amount</span>
                                <span>{order.amount} EGP</span>
                            </div>
                        </div>
                    </div>

                    {/* Change Status Area */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-700 mb-4">Update Order Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {orderStatuses.map((status) => (
                                <button
                                    key={status}
                                    disabled={loadingChange || order.order_status === status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                                        ${order.order_status === status
                                            ? 'bg-bg-primary text-white ring-2 ring-offset-2 ring-bg-primary'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'}`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Delivery Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                            <FaUser className="text-bg-primary" /> Customer Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                                <p className="font-medium">{order.user?.f_name} {order.user?.l_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                <p className="font-medium text-bg-primary">{order.user?.phone || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Branch */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                            <FaMoneyBillWave className="text-bg-primary" /> Order Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaMapMarkerAlt /></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Branch</p>
                                    <p className="text-sm font-medium">{order.branch?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FaMoneyBillWave /></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Payment Method</p>
                                    <p className="text-sm font-medium capitalize">{order.payment_method?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;