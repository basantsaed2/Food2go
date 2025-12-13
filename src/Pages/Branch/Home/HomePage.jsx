import React from "react";
import CartsOrderSection from "../../../components/CartsOrderSection";
import Chart from "./Charts/Chart";
import FooterCard from "./FooterHome/FooterCard";
import { useTranslation } from "react-i18next";
import Loading from "../../../components/Loading";
import { useGet } from "@/Hooks/UseGet";

const HomePage = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch Home chart data (for statistics, recent orders, etc.)
  const {
    isLoading: loadingChart,
    data: dataCharts,
  } = useGet({
    url: `${apiUrl}/branch/home`,
    queryKey: ['homeChartData'],
  });

  // 2. Fetch Orders summary data (for counter cards)
  const {
    isLoading: loadingOrders,
    data: dataOrders,
  } = useGet({
    url: `${apiUrl}/branch/home/orders_count`,
    queryKey: ['onlineOrdersSummary'],
  });

  // Combine loading states for the entire page
  const isLoading = loadingChart || loadingOrders;

  // --- Data Destructuring (Directly from dataCharts) ---
  const order_statistics = dataCharts?.order_statistics || {};
  const earning_statistics = dataCharts?.earning_statistics || {};
  const recent_orders = dataCharts?.recent_orders || [];
  const offers = dataCharts?.offers || [];
  const topSelling = dataCharts?.top_selling || [];
  const topCustomers = dataCharts?.top_customers || {};

  // --- Counter Calculation (Directly from dataOrders) ---
  const counters = {
    ordersAll: dataOrders?.orders || 0,
    ordersPending: dataOrders?.pending || 0,
    ordersConfirmed: dataOrders?.confirmed || 0,
    ordersProcessing: dataOrders?.processing || 0,
    ordersOutForDelivery: dataOrders?.out_for_delivery || 0,
    ordersDelivered: dataOrders?.delivered || 0,
    ordersReturned: dataOrders?.returned || 0,
    ordersFailed: dataOrders?.faild_to_deliver || 0,
    ordersCanceled: dataOrders?.canceled || 0,
    ordersSchedule: dataOrders?.scheduled || 0,
    ordersRefund: dataOrders?.refund || 0,
  };

  // The condition for showing the SMS message card
  const showSMSMessage = dataOrders?.msg_package !== false;

  const renderSMSMessageCard = () => {
    // Check both conditions (showSMSMessage condition and data existence)
    if (!showSMSMessage || !dataOrders?.msg_package) return null;

    // Existing Card JSX...
    return (
      <div className="w-full rounded-xl bg-white py-3 px-4 border border-gray-300 shadow-lg mb-6">
        <div className="flex items-center justify-between pb-1 mb-4 border-b-2">
          <h3 className="text-xl font-TextFontSemiBold text-mainColor">
            {t("SMS Package")}
          </h3>
        </div>

        <div className="w-full flex flex-col gap-y-4 pb-2">
          <div className="flex items-center justify-between w-full p-4 border-b-2 border-gray-300 shadow-md rounded-xl">
            <div className="flex flex-col items-start">
              <p className="text-gray-500 font-TextFontMedium">
                {t("Available Messages")}
              </p>
              <p className="text-lg font-TextFontSemiBold text-mainColor">
                {dataOrders.msg_package?.msg_number}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-gray-500 font-TextFontMedium">
                {t("Validity Period")}
              </p>
              <div className="text-right">
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("From")}: {dataOrders.msg_package?.from}
                </p>
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("To")}: {dataOrders.msg_package?.to}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col w-full mb-0">
        {isLoading ? ( // Check the combined loading state
          <div className="flex items-center justify-center w-full">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center w-full gap-7 pb-28">
            <CartsOrderSection ordersNum={counters} />

            <div className="flex flex-col items-start justify-center w-full px-4 gap-7">
              {/* <Chart
                order_statistics={order_statistics}
                earning_statistics={earning_statistics}
                recent_orders={recent_orders}
              /> */}
              <div className="flex flex-wrap items-center justify-between w-full gap-5">
                {renderSMSMessageCard()}

                <FooterCard
                  title={t("TopSellingProducts")}
                  link="/dashboard/setup_product/product"
                  layout={"TopSelling"}
                  topCustomers={topCustomers}
                  topSelling={topSelling}
                  offers={offers}
                />
                <FooterCard
                  title={t("TopCustomer")}
                  link="/dashboard/users/customers"
                  layout={"default"}
                  topCustomers={topCustomers}
                  topSelling={topSelling}
                  offers={offers}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;