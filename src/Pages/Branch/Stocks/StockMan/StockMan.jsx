import React, { useState, useEffect } from "react";
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/Hooks/UseGet';
import { useDelete } from '@/Hooks/useDelete';
import { useChangeState } from '@/Hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from "@/components/Loading";
import { FaPlus } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from '@/constants/queryKeys';
import { store } from "@/Store/store";

const StockMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // FETCH STOCKS Man
    const {
        data,
        isLoading: loadingStockMen,
        isError,
    } = useGet({
        url: `${apiUrl}/branch/purchase_store_man`,
        queryKey: QUERY_KEYS.STOCKMAN,
    });

    // MUTATIONS
    const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.STOCKMAN);
    const { changeState, loadingChange } = useChangeState(QUERY_KEYS.STOCKMAN);

    // LOCAL STATE
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // FORMAT DATA
    const stockMan = data?.store_men?.map((u) => ({
        id: u.id,
        user_name: u.user_name || "—",
        phone: u.phone || "—",
        store: u.store || {},
        store_name: u.store?.name || "—",
        status: u.status ? "Active" : "Inactive",
        rawStatus: u.status,
        image: u.image || null,
    })) || [];

    // HANDLERS
    const handleStatusChange = (id, newStatus) => {
        const url = `${apiUrl}/branch/purchase_store_man/status/${id}?status=${newStatus ? 1 : 0}`;
        changeState({
            url,
            successMessage: `${newStatus ? 'Activated' : 'Deactivated'} Successfully`,
        });
    };

    const handleEdit = (item) => {
        navigate(`edit/${item.id}`, { state: { itemData: item } });
    };

    const handleDelete = (item) => {
        setSelectedRow(item);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedRow) return;
        deleteData({
            url: `${apiUrl}/branch/purchase_stores/delete/${selectedRow.id}`,
            successMessage: `${selectedRow.name} Deleted Successfully`,
        });
        setIsDeleteOpen(false);
        setSelectedRow(null);
    };

    // COLUMNS
    const Columns = [
        {
            key: "image",
            label: "Image",
            renderCell: (item) => (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.user_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-500 text-sm">
                            {item.user_name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    )}
                </div>
            )
        },
        { key: "user_name", label: "User Name" },
        { key: "phone", label: "Phone" },
        { key: "store_name", label: "Store" },
        {
            key: "status",
            label: "Status",
            renderCell: (item) => (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={item.rawStatus}
                        onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
                        disabled={loadingChange}
                    />
                    <span className={item.rawStatus ? "text-green-600" : "text-red-600"}>
                        {item.status}
                    </span>
                </div>
            )
        },
    ];

    // ERROR UI
    if (isError) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-600">Failed to load stock man.</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCKMAN })}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-bg-primary font-bold">Stock Men</h2>
                <Link
                    to="add"
                    className="flex justify-center items-center px-4 py-1 rounded-md text-base bg-bg-primary font-semibold text-white hover:bg-bg-primary/90"
                >
                    <FaPlus className="mr-2 h-3 w-3 text-white" /> Add
                </Link>
            </div>
            {loadingStockMen ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={stockMan}
                    columns={Columns}
                    statusKey="status"
                    onEdit={(item) => handleEdit(item)}
                    onDelete={handleDelete}
                    className="w-full rounded-lg shadow-md p-6"
                />
            )}
            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onDelete={handleDeleteConfirm}
                name={selectedRow?.user_name}
                isLoading={loadingDelete}
            />
        </div>
    );
};

export default StockMan;