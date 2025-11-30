"use client";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import FullPageLoader from "@/components/Loading";
import { useGet } from "@/Hooks/UseGet";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Clipboard } from "lucide-react";
import { HiOutlineUsers, HiOutlineOfficeBuilding } from "react-icons/hi";

const ControlPanel = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const isLoading = useSelector((state) => state.loader.isLoading);
    const [homeStats, setHomeStats] = useState({
        totalActiveJobs: 0,
        totalCompanies: 0,
        totalPendingEmployeerRequests: 0,
        totalUsers: 0
    });

    const { refetch: refetchHomeList, loading: loadingHomeList, data: HomeListData } = useGet({
        url: `${apiUrl}/branch/homePage`,
    });
    const { t } = useTranslation();

    useEffect(() => {
        refetchHomeList();
    }, [refetchHomeList]);

    useEffect(() => {
        if (HomeListData) {
            setHomeStats(HomeListData);
        }
    }, [HomeListData]);

    if (isLoading || loadingHomeList) {
        return <FullPageLoader />;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-bg-primary mb-6">
                {t("Dashboard")}
            </h2>
        </div>
    );
};

export default ControlPanel;