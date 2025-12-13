
import { CanceledIcon, ConfirmedIcon, DeliveredIcon, FailedToDeliverIcon, OutForDeliveryIcon, PendingIcon, ReturnedIcon, ProcessingIcon } from './Icons/AllIcons'
import { RiRefund2Line } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import Cart from "./Cart";

const CartsOrderSection = ({ ordersNum }) => {
    const { t, i18n } = useTranslation();

    return (
        <>
            <div className="flex flex-wrap items-start justify-center w-full gap-4 mt-4 sm:flex-col lg:flex-row">
                <Cart
                    route={'/dashboard/orders/pending'}
                    icon={<PendingIcon />}
                    title={t('Pending')}
                    count={ordersNum.ordersPending || 0}
                />
                <Cart
                    route={'/dashboard/orders/confirmed'}
                    icon={<ProcessingIcon />}
                    title={t('Accept')}
                    count={ordersNum.ordersProcessing || 0}
                />
                <Cart
                    route={'/dashboard/orders/processing'}
                    icon={<ConfirmedIcon />}
                    title={t('Processing')}
                    count={ordersNum.ordersConfirmed || 0}
                />
                <Cart
                    route={'/dashboard/orders/out_for_delivery'}
                    icon={<OutForDeliveryIcon />}
                    title={t('OutForDelivery')}
                    count={ordersNum.ordersOutForDelivery || 0}
                />
                <Cart
                    route={'/dashboard/orders/delivered'}
                    icon={<DeliveredIcon />}
                    title={t('Delivered')}
                    count={ordersNum.ordersDelivered || 0}
                />
                <Cart
                    route={'/dashboard/orders/canceled'}
                    icon={<CanceledIcon />}
                    title={t('Canceled')}
                    count={ordersNum.ordersCanceled || 0}
                />
                <Cart
                    route={'/dashboard/orders/returned'}
                    icon={<ReturnedIcon />}
                    title={t('Returned')}
                    count={ordersNum.ordersReturned || 0}
                />
                <Cart
                    route={'/dashboard/orders/refund'}
                    icon={<RiRefund2Line className='text-4xl text-mainColor' />}
                    title={t('Refund')}
                    count={ordersNum.ordersRefund || 0}
                />
                <Cart
                    route={'/dashboard/orders/failed_to_deliver'}
                    icon={<FailedToDeliverIcon />}
                    title={t('FailedToDeliver')}
                    count={ordersNum.ordersFailed || 0}
                />
            </div>
        </>
    )
}

export default CartsOrderSection