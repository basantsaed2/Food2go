// src/pages/AddStockProduct.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddStockProduct = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { productId } = useParams(); // Changed from stockId to productId
  const navigate = useNavigate();
  const { state } = useLocation();

  const isEditMode = !!productId;
  const title = isEditMode ? 'Edit Product' : 'Add Product'; // Updated title
  const itemData = state?.itemData;

  // FETCH CATEGORIES (instead of branches)
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useGet({
    url: `${apiUrl}/branch/purchase_product`, // Updated endpoint
    queryKey: QUERY_KEYS.CATEGORIES,
  });

  // Format categories for dropdown
  const categories = categoriesData?.categories?.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  })) || [];

  // MUTATIONS
  const addUrl = `${apiUrl}/branch/purchase_product/add`; // Updated endpoint
  const updateUrl = `${apiUrl}/branch/purchase_product/update/${productId}`; // Updated endpoint

  const { postData: addProduct, loadingPost: adding } = usePost(addUrl, QUERY_KEYS.PRODUCTS);
  const { postData: updateProduct, loadingPost: updating } = usePost(updateUrl, QUERY_KEYS.PRODUCTS);

  // FORM STATE
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && itemData) {
      console.log('Item Data:', itemData);
      setValues({
        name: itemData.name || '',
        description: itemData.description || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        category_id: itemData.category_id.toString() || '',
      });
    } else {
      setValues({
        name: '',
        description: '',
        status: 'Active',
        category_id: ''
      });
    }
    setErrors({});
  }, [isEditMode, itemData]);

  // FORM FIELDS - Updated for products
  const fields = [
    {
      name: 'name',
      type: 'input',
      placeholder: 'Product Name',
      required: true
    },
    {
      name: 'description',
      type: 'textarea',
      placeholder: 'Product Description',
      required: true
    },
    {
      name: 'category_id',
      type: 'select',
      placeholder: 'Category',
      options: categories,
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

  const handleChange = (_lang, name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    // Validation
    const newErrors = {};
    if (!values.name?.trim()) newErrors.name = 'Product name is required';
    if (!values.description?.trim()) newErrors.description = 'Description is required';
    if (!values.category_id) newErrors.category_id = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: values.name?.trim() || '',
      description: values.description?.trim() || '',
      category_id: values.category_id,
      status: values.status === 'Active' ? 1 : 0,
    };

    const successMessage = isEditMode
      ? 'Product Updated Successfully!'
      : 'Product Added Successfully!';

    const onSuccess = () => {
      navigate(-1);
    };

    if (isEditMode) {
      updateProduct(payload, successMessage, onSuccess);
    } else {
      addProduct(payload, successMessage, onSuccess);
    }
  };

  const handleReset = () => {
    if (isEditMode && itemData) {
      setValues({
        name: itemData.name || '',
        description: itemData.description || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        category_id: itemData.category_id || '',
      });
    } else {
      setValues({
        name: '',
        description: '',
        status: 'Active',
        category_id: ''
      });
    }
    setErrors({});
  };

  const handleBack = () => navigate(-1);

  // LOADING IN EDIT MODE WITHOUT DATA
  if (isEditMode && !itemData) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
        </div>
        <p className="text-center py-8">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
      </div>

      <div className="py-10 px-4 bg-white rounded-lg shadow-md">
        {loadingCategories ? (
          <FullPageLoader />
        ) : (
          <Add
            fields={fields}
            values={values}
            onChange={handleChange}
            errors={errors}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={adding || updating}
          className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={adding || updating}
          className="px-4 py-2 bg-bg-primary text-white rounded-md hover:bg-bg-primary/90"
        >
          {adding || updating ? 'Submitting…' : isEditMode ? 'Update' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default AddStockProduct;