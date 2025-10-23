import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '@/Hooks/UsePost';
import { useGet } from '@/Hooks/UseGet';
import FullPageLoader from '@/components/Loading';

const AddStockMan = ({ lang = 'en' }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { stockId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { postData: postNewData, loadingPost: loadingNewData, response: NewResponse } = usePost({ url: `${apiUrl}/admin/purchase_stores/add` });
    const { postData, loadingPost, response: postResponse } = usePost({ url: `${apiUrl}/admin/purchase_stores/update/${stockId}` });
    const { refetch: refetchBranches, loading: loadingBranches, data: dataBranches } = useGet({ url: `${apiUrl}/admin/purchase_stores` });

    const [Branches, setBranches] = useState([]);
    const [values, setValues] = useState({});

    // Get the item data from navigation state
    const { state } = location;
    const itemData = state?.itemData;

    // Determine if we're in "edit" mode based on whether stockId exists
    const isEditMode = !!stockId;
    const title = isEditMode ? 'Edit Stock' : 'Add Stock';

    console.log(itemData)

    useEffect(() => {
        refetchBranches();
    }, [refetchBranches]);

    useEffect(() => {
        if (dataBranches && dataBranches?.branches) {
            const formattedBranches = dataBranches.branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
            }));
            setBranches(formattedBranches);
        }
    }, [dataBranches]);

    // Set initial values from navigation state when in edit mode
    useEffect(() => {
        if (isEditMode && itemData) {
            // Extract just the branch IDs for the multi-select
            const branchIds = itemData.branches?.map(branch => branch.id) || [];
            setValues({
                id: itemData.id || '',
                name: itemData.name || '',
                location: itemData.location || '',
                status: itemData.status || "Active",
                branches: branchIds, // Use just the IDs for the multi-select
            });
        } else if (!isEditMode) {
            // Reset values for add mode
            setValues({
                name: '',
                location: '',
                status: "Active",
                branches: [],
            });
        }
    }, [isEditMode, itemData]);

    // Define the fields for the form
    const fields = [
        { name: 'name', type: 'input', placeholder: 'Stock Name' },
        { name: 'location', type: 'input', placeholder: 'Area' },
        {
            name: 'branches',
            type: 'multi-select',
            placeholder: 'Branches',
            options: Branches,
        },
        {
            type: 'switch',
            name: 'status',
            placeholder: 'Status',
            returnType: 'string',
            activeLabel: 'Active',
            inactiveLabel: 'Inactive',
        },
    ];

    const handleChange = (lang, name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const data = {
            name: values.name || '',
            location: values.location || '',
            branches: values.branches || [], // This should be an array of branch IDs
            status: values.status?.toLowerCase() === "active" ? 1 : 0,
        };

        if (isEditMode) {
            await postData(data, 'Stock Updated Successfully!');
        } else {
            await postNewData(data, 'Stock Added Successfully!');
        }
    };

    // Handle navigation after successful submission
    useEffect(() => {
        if ((!loadingNewData && NewResponse) || (!loadingPost && postResponse)) {
            navigate(-1);
        }
    }, [loadingNewData, NewResponse, loadingPost, postResponse, navigate]);

    const handleReset = () => {
        if (isEditMode && itemData) {
            // Extract just the branch IDs for the multi-select
            const branchIds = itemData.branches?.map(branch => branch.id) || [];

            setValues({
                id: itemData.id || '',
                name: itemData.name || '',
                location: itemData.location || '',
                status: itemData.status || "Active",
                branches: branchIds,
            });
        } else {
            setValues({
                name: '',
                location: '',
                status: "Active",
                branches: [],
            });
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Show loading if in edit mode but no item data is available
    if (isEditMode && !itemData) {
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 bg-white text-bg-primary rounded-md mr-3"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl text-bg-primary font-bold">{title}</h2>
                </div>
                <div className="text-center py-8">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="p-2 bg-white text-bg-primary rounded-md mr-3"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl text-bg-primary font-bold">{title}</h2>
            </div>

            <div className="py-10 px-4 bg-white rounded-lg shadow-md">
                {loadingBranches ? (
                    <FullPageLoader />
                ) : (
                    <Add
                        fields={fields}
                        lang={lang}
                        values={values}
                        onChange={handleChange}
                    />
                )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                    disabled={loadingPost || loadingNewData}
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-bg-primary text-white rounded-md hover:bg-bg-primary/90"
                    disabled={loadingPost || loadingNewData}
                >
                    {loadingPost || loadingNewData ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default AddStockMan;