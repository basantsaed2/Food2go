import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { Cog, ChevronDown, ChevronRight, SquareChartGantt, Grid2X2Check, LayoutTemplate, TicketPercent, UserRoundCheck, DollarSign, PackagePlus, UserLock } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RiSecurePaymentFill } from "react-icons/ri";
import logo from "@/assets/Logo.jpeg"
import { FaUsers } from "react-icons/fa6";
import { TbWorldCheck } from "react-icons/tb";

const navItems = [
    { label: "Home", to: "/", icon: <AiOutlineHome className="stroke-2" size={20} /> },
    { label: "Stock", to: "/stock", icon: <PackagePlus className="stroke-2" size={20} /> },
    { label: "Stock Man", to: "/stock_man", icon: <UserLock className="stroke-2" size={20} /> },
];

export function AdminSidebar() {
    const location = useLocation();
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const user = useSelector((state) => state.auth.user);

    const [expandedItems, setExpandedItems] = useState({});

    useEffect(() => {
        const initialExpanded = {};
        navItems.forEach((item) => {
            if (item.subItems) {
                // Expand only if the current route matches a sub-item
                const isParentActive = item.subItems.some((sub) =>
                    location.pathname.startsWith(sub.to)
                );
                initialExpanded[item.label] = isParentActive;
            }
        });
        setExpandedItems(initialExpanded); // Reset state to collapse non-active menus
    }, [location.pathname]);

    const toggleExpand = (label) => {
        setExpandedItems((prev) => {
            const isParentActive = navItems
                .find((item) => item.label === label)
                ?.subItems?.some((sub) => location.pathname.startsWith(sub.to));
            return {
                ...prev,
                [label]: isParentActive ? true : !prev[label],
            };
        });
    };

    return (
        <Sidebar
            side={isRTL ? "right" : "left"}
            className="bg-bg-primary rounded-r-4xl p-2 border-none sm:border-none overflow-x-hidden h-full shadow-lg transition-all duration-300 font-cairo"
        >
            <SidebarContent
                className="bg-bg-primary p-4 pb-5 text-white border-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
            >
                <SidebarGroup>
                    <SidebarGroupLabel className="p-2 text-white flex items-center justify-center gap-2">
                        <span className="text-3xl leading-[30px] font-bold text-center text-white">
                            Food2go
                        </span>
                    </SidebarGroupLabel>
                    <hr className="w-full border-white !mb-3" />

                    <SidebarGroupContent>
                        <SidebarMenu className="list-none p-0 rounded-md flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = (() => {
                                    if (item.to === "/") {
                                        return location.pathname === "/";
                                    } else if (item.subItems) {
                                        return item.subItems.some((sub) => location.pathname.startsWith(sub.to));
                                    } else if (item.to) {
                                        return location.pathname.startsWith(item.to);
                                    }
                                    return false;
                                })();

                                const isExpanded = expandedItems[item.label];

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        {item.to && !item.subItems ? (
                                            <Link to={item.to}>
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    className={`flex cursor-pointer justify-between items-center gap-3 !p-2 text-white transition-all duration-200 text-base font-medium
                            ${isActive ? "shadow-md bg-white text-bg-primary" : "bg-bg-primary text-white hover:bg-white hover:text-bg-primary"}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.icon}
                                                        <span className="text-base">{item.label}</span>
                                                    </div>
                                                </SidebarMenuButton>
                                            </Link>
                                        ) : (
                                            <SidebarMenuButton
                                                onClick={() => toggleExpand(item.label)}
                                                isActive={isActive}
                                                className={`flex cursor-pointer justify-between items-center gap-3 !p-2 text-bg-primary transition-all duration-200 text-base font-medium
                            ${isActive ? "shadow-md bg-white text-bg-primary" : "bg-bg-primary text-white hover:bg-white hover:text-bg-primary"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span className="text-bas">{item.label}</span>
                                                </div>
                                                {item.subItems && (
                                                    <span>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                                                )}
                                            </SidebarMenuButton>
                                        )}

                                        {item.subItems && isExpanded && (
                                            <div className="!ml-6 mt-3 flex flex-col gap-2">
                                                {item.subItems.map((subItem) => {
                                                    const isSubActive = location.pathname.startsWith(subItem.to);
                                                    return (
                                                        <Link
                                                            to={subItem.to}
                                                            key={subItem.label}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <SidebarMenuButton
                                                                isActive={isSubActive}
                                                                className={`flex cursor-pointer justify-start items-center gap-3 !px-4 !py-2 text-bg-primary transition-all duration-200 text-base
                            ${isSubActive ? "shadow-md bg-white text-bg-primary" : "bg-bg-primary text-white hover:bg-white hover:text-bg-primary"}`}
                                                            >
                                                                {subItem.icon}
                                                                <span className="text-bas">{subItem.label}</span>
                                                            </SidebarMenuButton>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}