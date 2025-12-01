import React, { useEffect, useState } from "react";
import CartsOrderSection from "../Orders/AllOrders/CartsOrderSection";
import { LoaderLogin } from "../../../../Components/Components";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useGet } from "../../../../Hooks/useGet";
import Chart from "./Charts/Chart";
import FooterCard from "./FooterHome/FooterCard";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ Home chart
  const {
    refetch: refetchChart,
    loading: loadingChart,
    data: dataCharts,
  } = useGet({
    url: `${apiUrl}/branch/home`
  });

  // ✅ Orders summary
  const {
    refetch: refetchOrders,
    loading: loadingOrders,
    data: dataOrders,
  } = useGet({
    url: `${apiUrl}/branch/home/online_order`
  });

  const [dataHome, setDataHome] = useState([]);
  const [order_statistics, setOrder_statistics] = useState({})
  const [earning_statistics, setEarning_statistics] = useState({})
  const [orders, setOrders] = useState({})
  const [recent_orders, setRecent_orders] = useState([])
  const [offers, setOffers] = useState([])
  const [topSelling, SetTopSelling] = useState([])
  const [topCustomers, setTopCustomers] = useState({})
  const [showSMSMessage, setShowSMSMessage] = useState(false);

  useEffect(() => {
    refetchChart();
    refetchOrders();
  }, [refetchChart, refetchOrders]);

  useEffect(() => {
    if (dataCharts) {
      setDataHome(dataCharts);
      setOrder_statistics(dataCharts.order_statistics)
      setEarning_statistics(dataCharts.earning_statistics)
      setRecent_orders(dataCharts.recent_orders)
      setOffers(dataCharts.offers)
      SetTopSelling(dataCharts.top_selling)
      setTopCustomers(dataCharts.top_customers)
    }
  }, [dataCharts, dataHome, order_statistics]);

  useEffect(() => {
    if (dataOrders?.msg_package !== false) {
      setShowSMSMessage(true);
    }
  }, [dataOrders]);

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

  const renderSMSMessageCard = () => {
    if (!showSMSMessage || !dataOrders?.msg_package) return null;

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
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        {(loadingOrders) ? (
          <>
            <div className="flex items-center justify-center w-full">
              <LoaderLogin />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-start justify-center w-full gap-7 pb-28">

              <CartsOrderSection ordersNum={counters} />

              <div className="flex flex-col items-start justify-center w-full px-4 gap-7">
                <Chart
                  order_statistics={order_statistics}
                  earning_statistics={earning_statistics}
                  recent_orders={recent_orders}
                  orders={orders}
                />
                <div className="flex flex-wrap items-center justify-between w-full gap-5">
                  {renderSMSMessageCard()}

                  <FooterCard title={t("TopSellingProducts")} link="/dashboard/setup_product/product" layout={"TopSelling"} topCustomers={topCustomers} topSelling={topSelling} offers={offers} />
                  <FooterCard title={t("TopCustomer")} link="/dashboard/users/customers" layout={"default"} topCustomers={topCustomers} topSelling={topSelling} offers={offers} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;