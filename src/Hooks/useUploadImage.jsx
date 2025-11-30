// src/hooks/useUploadImage.js
import { useMutationHook } from './useMutationHook';

export const useUploadImage = ({ invalidateKey, successMessage = "تم رفع الصورة" } = {}) => {
    const { mutate: uploadImage, isPending: uploading } = useMutationHook({
        method: 'post',
        invalidateKey,
    });

    const execute = (file, customUrl = `${import.meta.env.VITE_API_BASE_URL}/api/upload`) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        uploadImage({
            url: customUrl,
            data: formData,
            successMessage,
        });
    };

    return { uploadImage: execute, uploading };
};