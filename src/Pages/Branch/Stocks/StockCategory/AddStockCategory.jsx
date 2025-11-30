// src/pages/AddStockCategory.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddStockCategory = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const isEditMode = !!categoryId;
  const itemData = state?.itemData;

  // Determine if we're adding/editing parent or sub category
  const isParentCategory = !itemData?.parent_category || itemData?.parent_category === '—';
  const title = isEditMode
    ? `Edit ${isParentCategory ? 'Main' : 'Sub'} Category`
    : 'Add Category';

  // FETCH PARENT CATEGORIES for dropdown (only for sub-categories)
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useGet({
    url: `${apiUrl}/branch/purchase_categories`,
    queryKey: QUERY_KEYS.CATEGORIES_LIST,
    enabled: !isEditMode || !isParentCategory, // Only fetch if needed
  });

  // Format parent categories for dropdown
  const parentCategories = categoriesData?.parent_categories?.map((c) => ({
    value: c.id?.toString(),
    label: c.name,
  })) || [];

  // MUTATIONS
  const addUrl = `${apiUrl}/branch/purchase_categories/add`;
  const updateUrl = `${apiUrl}/branch/purchase_categories/update/${categoryId}`;

  const { postData: addCategory, loadingPost: adding } = usePost(addUrl, QUERY_KEYS.CATEGORIES);
  const { postData: updateCategory, loadingPost: updating } = usePost(updateUrl, QUERY_KEYS.CATEGORIES);

  // FORM STATE
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [categoryType, setCategoryType] = useState(isParentCategory ? 'parent' : 'sub');

  useEffect(() => {
    if (isEditMode && itemData) {
      setValues({
        name: itemData.name || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        category_id: itemData.parent_category !== '—' ? itemData.category_id?.toString() : '',
      });
      setCategoryType(itemData.parent_category !== '—' ? 'sub' : 'parent');
    } else {
      setValues({
        name: '',
        status: 'Active',
        category_id: '',
        category_type: 'parent'
      });
      setCategoryType('parent');
    }
    setErrors({});
  }, [isEditMode, itemData]);

  // FORM FIELDS - Dynamic based on category type
  const getFields = () => {
    const baseFields = [
      {
        name: 'name',
        type: 'input',
        placeholder: 'Category Name',
        required: true
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

    // Only show category type selector when adding new category
    if (!isEditMode) {
      baseFields.unshift({
        name: 'category_type',
        type: 'select',
        placeholder: 'Category Type',
        options: [
          { value: 'parent', label: 'Main Category' },
          { value: 'sub', label: 'Sub Category' },
        ],
        required: true
      });
    }

    // Only show parent category dropdown for sub-categories
    if (categoryType === 'sub') {
      baseFields.splice(1, 0, {
        name: 'category_id',
        type: 'select',
        placeholder: 'Parent Category',
        options: parentCategories,
        required: true,
        helpText: 'Select a parent category for this sub-category'
      });
    }

    return baseFields;
  };

  const handleChange = (_lang, name, value) => {
    if (name === 'category_type') {
      setCategoryType(value);
      // Reset category_id when changing type
      setValues(prev => ({
        ...prev,
        category_type: value,
        category_id: value === 'parent' ? '' : prev.category_id
      }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    // Validation
    const newErrors = {};
    if (!values.name?.trim()) newErrors.name = 'Category name is required';
    if (!isEditMode && !values.category_type) newErrors.category_type = 'Category type is required';
    if (categoryType === 'sub' && !values.category_id) newErrors.category_id = 'Parent category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ CORRECT PAYLOAD: Only include category_id for sub-categories
    const payload = {
      name: values.name?.trim() || '',
      status: values.status === 'Active' ? 1 : 0,
    };

    // ✅ Only add category_id for sub-categories
    if (categoryType === 'sub' && values.category_id) {
      payload.category_id = values.category_id;
    }
    // For main categories, don't include category_id at all

    const successMessage = isEditMode
      ? 'Category Updated Successfully!'
      : 'Category Added Successfully!';

    const onSuccess = () => {
      navigate(-1);
    };

    if (isEditMode) {
      updateCategory(payload, successMessage, onSuccess);
    } else {
      addCategory(payload, successMessage, onSuccess);
    }
  };

  const handleReset = () => {
    if (isEditMode && itemData) {
      setValues({
        name: itemData.name || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        category_id: itemData.parent_category !== '—' ? itemData.category_id : '',
      });
      setCategoryType(itemData.parent_category !== '—' ? 'sub' : 'parent');
    } else {
      setValues({
        name: '',
        status: 'Active',
        category_id: '',
        category_type: 'parent'
      });
      setCategoryType('parent');
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
        {loadingCategories && categoryType === 'sub' ? (
          <FullPageLoader />
        ) : (
          <Add
            fields={getFields()}
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

export default AddStockCategory;