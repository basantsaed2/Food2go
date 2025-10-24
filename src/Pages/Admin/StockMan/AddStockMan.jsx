import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '@/Hooks/UsePost';
import { useGet } from '@/Hooks/UseGet';
import FullPageLoader from '@/components/Loading';

const AddStockMan = ({ lang = 'en' }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { stockManId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { postData: postNewData, loadingPost: loadingNewData, response: NewResponse } = usePost({ url: `${apiUrl}/admin/purchase_store_man/add` });
    const { postData, loadingPost, response: postResponse } = usePost({ url: `${apiUrl}/admin/purchase_store_man/update/${stockManId}` });
    const { refetch: refetchStores, loading: loadingStores, data: dataStores } = useGet({ url: `${apiUrl}/admin/purchase_stores` });

    const [Stores, setStores] = useState([]);
    const [values, setValues] = useState({});

    // Get the item data from navigation state
    const { state } = location;
    const itemData = state?.itemData;

    // Determine if we're in "edit" mode based on whether stockManId exists
    const isEditMode = !!stockManId;
    const title = isEditMode ? 'Edit Stock Man' : 'Add Stock Man';

    useEffect(() => {
        refetchStores();
    }, [refetchStores]);

    useEffect(() => {
        if (dataStores && dataStores?.stores) {
            const formattedStores = dataStores.stores.map((store) => ({
                value: store.id.toString() || "",
                label: store.name,
            }));
            setStores(formattedStores);
        }
    }, [dataStores]);

    // Set initial values from navigation state when in edit mode
    useEffect(() => {
        if (isEditMode && itemData) {
            setValues({
                id: itemData.id || '',
                user_name: itemData.user_name || '',
                phone: itemData.phone || '',
                password: '', // Don't pre-fill password for security
                store_id: itemData.store_id || itemData.store?.id || '',
                status: itemData.status || "Active",
                image: itemData.image || null,
            });
        } else if (!isEditMode) {
            // Reset values for add mode
            setValues({
                user_name: '',
                phone: '',
                password: '',
                store_id: '',
                status: "Active",
                image: null,
            });
        }
    }, [isEditMode, itemData]);

    // Define the fields for the form
    const fields = [
        { 
            name: 'user_name', 
            type: 'input', 
            placeholder: 'User Name',
            required: true
        },
        { 
            name: 'phone', 
            type: 'input', 
            placeholder: 'Phone Number',
            inputType: 'tel'
        },
        { 
            name: 'password', 
            type: 'input', 
            placeholder: 'Password',
            inputType: 'password',
            required: !isEditMode // Password required only for new users
        },
        {
            name: 'store_id',
            type: 'select',
            placeholder: 'Select Store',
            options: Stores,
        },
        {
            name: 'image',
            type: 'file',
            placeholder: 'Profile Image',
            accept: 'image/*'
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
        // Create FormData to handle file upload
        const formData = new FormData();
        
        // Append all fields
        formData.append('user_name', values.user_name || '');
        formData.append('phone', values.phone || '');
        if (values.password) {
            formData.append('password', values.password);
        }
        formData.append('stora_id', values.store_id || '');
        formData.append('status', values.status?.toLowerCase() === "active" ? 1 : 0);
        
        // Append image file if exists
        if (values.image && typeof values.image !== 'string') {
            formData.append('image', values.image);
        }

        if (isEditMode) {
            await postData(formData, 'Stock Man Updated Successfully!');
        } else {
            await postNewData(formData, 'Stock Man Added Successfully!');
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
            setValues({
                id: itemData.id || '',
                user_name: itemData.user_name || '',
                phone: itemData.phone || '',
                password: '', // Reset password field
                store_id: itemData.store_id || itemData.store?.id || '',
                status: itemData.status || "Active",
                image: itemData.image || null,
            });
        } else {
            setValues({
                user_name: '',
                phone: '',
                password: '',
                store_id: '',
                status: "Active",
                image: null,
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
                {loadingStores ? (
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