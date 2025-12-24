import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import Add from '@/components/AddFieldSection';
import { usePost } from '@/hooks/usePost';
import { QUERY_KEYS } from '@/constants/queryKeys';
import TitleSection from '@/components/TitleSection';
import ActionsButtons from '@/components/ActionsButtons';

// Schema validation
const deliverySchema = z.object({
    f_name: z.string().min(2, "Required"),
    l_name: z.string().min(2, "Required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(8, "Required"),
    password: z.string().min(6, "6+ chars required").optional().or(z.literal('')),
    identity_type: z.string().min(1, "Required"),
    identity_number: z.string().min(1, "Required"),
    image: z.any().nullable(),
    identity_image: z.any().nullable(),
    status: z.boolean(),
    chat_status: z.boolean(),
    phone_status: z.boolean(),
});

const AddDeliveyMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { deliveryManId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useSelector(state => state.auth);

    const isEditMode = !!deliveryManId;
    const itemData = state?.itemData;

    const { postData, loadingPost } = usePost({
        url: isEditMode ? `${apiUrl}/branch/delivery/update/${deliveryManId}` : `${apiUrl}/branch/delivery/add`,
        invalidateKey: QUERY_KEYS.DELIVERY_MAN,
    });

    const identityTypes = [
        { value: "Card", label: "National ID" },
        { value: "Passport", label: "Passport" },
    ];

    const initialValues = useMemo(() => {
        const base = {
            f_name: '',
            l_name: '',
            email: '',
            phone: '',
            password: '',
            identity_type: 'Card',
            identity_number: '',
            image: null, // Initialized as null to avoid {}
            identity_image: null, // Initialized as null to avoid {}
            status: true,
            chat_status: true,
            phone_status: true
        };
        if (isEditMode && itemData) {
            return {
                ...base,
                f_name: itemData.f_name || '',
                l_name: itemData.l_name || '',
                email: itemData.email || '',
                phone: itemData.phone || '',
                identity_type: itemData.identity_type || 'Card',
                identity_number: itemData.identity_number || '',
                status: itemData.status === 1,
                chat_status: itemData.chat_status === 1,
                phone_status: itemData.phone_status === 1,
            };
        }
        return base;
    }, [isEditMode, itemData]);

    const fields = useMemo(() => [
        { name: 'f_name', type: 'input', placeholder: 'First Name', required: true },
        { name: 'l_name', type: 'input', placeholder: 'Last Name', required: true },
        { name: 'email', type: 'input', placeholder: 'Email', inputType: 'email', required: true },
        { name: 'phone', type: 'input', placeholder: 'Phone Number', required: true },
        { name: 'password', type: 'input', placeholder: 'Password', inputType: 'password', required: !isEditMode },
        { name: 'identity_type', type: 'select', placeholder: 'ID Type', options: identityTypes },
        { name: 'identity_number', type: 'input', placeholder: 'ID Number' },
        { name: 'image', type: 'file', placeholder: 'Profile Image' },
        { name: 'identity_image', type: 'file', placeholder: 'ID Image Document' },
        { type: 'switch', name: 'status', placeholder: 'Active' },
        { type: 'switch', name: 'chat_status', placeholder: 'Enable Chat' },
        { type: 'switch', name: 'phone_status', placeholder: 'Verify Phone' },
    ], [isEditMode]);

    const handleSubmit = (values) => {
        const formData = new FormData();

        // 1. Text fields - convert branch_id to string
        formData.append('f_name', values.f_name);
        formData.append('l_name', values.l_name);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        formData.append('identity_type', values.identity_type);
        formData.append('identity_number', values.identity_number);
        formData.append('branch_id', String(user?.id || ''));

        if (values.password) {
            formData.append('password', values.password);
        }

        // 2. Booleans to Strings (PHP/Laravel specific fix)
        formData.append('status', values.status ? "1" : "0");
        formData.append('chat_status', values.chat_status ? "1" : "0");
        formData.append('phone_status', values.phone_status ? "1" : "0");

        // 3. Binary Files (Strict check to prevent "array given" error)
        // We only append if the value is a real File object.
        if (values.image instanceof File) {
            formData.append('image', values.image);
        }

        if (values.identity_image instanceof File) {
            formData.append('identity_image', values.identity_image);
        }

        // 4. Hook call using the correct object structure
        postData(formData, {
            successMessage: isEditMode ? 'Updated successfully!' : 'Created successfully!',
            onSuccess: () => navigate(-1)
        });
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <TitleSection text={isEditMode ? 'Edit Delivery Man' : 'Add Delivery Man'} />

            <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(deliverySchema)}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue, handleSubmit, resetForm }) => (
                    <div className="w-full">
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                            <Add
                                fields={fields}
                                values={values}
                                errors={errors}
                                touched={touched}
                                onChange={(_, name, val) => setFieldValue(name, val)}
                            />
                        </div>

                        <ActionsButtons
                            resetForm={resetForm}
                            handleSubmit={handleSubmit}
                            loadingPost={loadingPost}
                            isEditMode={isEditMode}
                        />
                    </div>
                )}
            </Formik>
        </div>
    );
};

export default AddDeliveyMan;