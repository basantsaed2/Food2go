// src/pages/AddFinancial.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddFinancial = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { financialId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    const isEditMode = !!financialId;
    const title = isEditMode ? 'Edit Financial Account' : 'Add Financial Account';
    const itemData = state?.itemData;

    const { postData: addFinancial, loadingPost: adding } = usePost({
        url: `${apiUrl}/branch/financial/add`,
        invalidateKey: QUERY_KEYS.FINANCIAL,
    });

    const { postData: updateFinancial, loadingPost: updating } = usePost({
        url: `${apiUrl}/branch/financial/update/${financialId}`,
        invalidateKey: QUERY_KEYS.FINANCIAL
    });

    const [values, setValues] = useState({
        name: '',
        details: '',
        balance: '',
        discount: false,        // Now a boolean (switch)
        description_status: false,
        status: true,
        logo: null,
    });

    useEffect(() => {
        if (isEditMode && itemData) {
            setValues({
                name: itemData.name || '',
                details: itemData.details || '',
                balance: itemData.balance || '',
                discount: !!itemData.discount,           // Convert 1/0 to true/false
                description_status: !!itemData.description_status,
                status: !!itemData.status,
                logo: itemData.logo || null,
            });
        }
        // No need to reset to defaults in else — initial state already handles add mode
    }, [isEditMode, itemData]);

    const fields = [
        {
            name: 'name',
            type: 'input',
            placeholder: 'Financial Account Name',
            required: true,
        },
        {
            name: 'details',
            type: 'input',
            placeholder: 'Details / Description',
        },
        {
            name: 'balance',
            type: 'input',
            placeholder: 'Initial Balance',
            inputType: 'number',
        },
        {
            name: 'logo',
            type: 'file',
            placeholder: 'Upload Logo / Icon (optional)',
            accept: 'image/*',
        },
        {
            type: 'switch',
            name: 'discount',
            placeholder: 'Discount Enabled',
        },
        {
            type: 'switch',
            name: 'description_status',
            placeholder: 'Visa / Card Payment Enabled',
        },
        {
            type: 'switch',
            name: 'status',
            placeholder: 'Account Status',
        },
    ];

    const handleChange = (_lang, name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const formData = new FormData();

        formData.append('name', values.name);
        formData.append('details', values.details);
        formData.append('balance', values.balance);
        formData.append('discount', values.discount ? 1 : 0);
        formData.append('description_status', values.description_status ? 1 : 0);
        formData.append('status', values.status ? 1 : 0);
        formData.append('logo', values.logo);

        if (values.logo && typeof values.logo !== 'string') {
            formData.append('logo', values.logo);
        }

        const successMessage = isEditMode
            ? 'Financial Account Updated Successfully!'
            : 'Financial Account Added Successfully!';

        const onSuccess = () => navigate(-1);

        if (isEditMode) {
            updateFinancial(formData, successMessage, onSuccess);
        } else {
            addFinancial(formData, successMessage, onSuccess);
        }
    };

    const handleReset = () => {
        setValues({
            name: itemData?.name || '',
            details: itemData?.details || '',
            balance: itemData?.balance || '',
            discount: !!itemData?.discount,
            description_status: !!itemData?.description_status,
            status: !!itemData?.status,
            logo: itemData?.logo || null,
        });
    };

    const handleBack = () => navigate(-1);

    if (isEditMode && !itemData) {
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
                </div>
                <p className="text-center py-8">Loading form data…</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBack}
                    className="p-2 bg-white text-bg-primary rounded-md mr-4 shadow hover:shadow-md transition"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-bg-primary">{title}</h2>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <Add fields={fields} values={values} onChange={handleChange} />
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={adding || updating}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={adding || updating}
                    className="px-6 py-3 bg-bg-primary text-white rounded-lg font-medium hover:bg-bg-primary/90 transition disabled:opacity-50"
                >
                    {adding || updating ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
                </button>
            </div>
        </div>
    );
};

export default AddFinancial;