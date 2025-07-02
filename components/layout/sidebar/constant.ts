import { ClipboardList, LayoutDashboard, Calendar, Users, Package, FlaskConical, FileText, PieChart, Settings2, Building } from "lucide-react"

export const navGroups = [
    {
        title: "Core Operations",
        icon: ClipboardList,
        allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                color: "text-blue-500",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            },
            {
                href: "/appointments",
                label: "Appointments",
                icon: Calendar,
                color: "text-blue-500",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            },
            {
                href: "/patients",
                label: "Patients",
                icon: Users,
                color: "text-blue-500",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            },
            {
                href: "/clients",
                label: "Clients",
                icon: Users,
                color: "text-blue-500",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            },

            // {
            //     href: "/prescriptions",
            //     label: "Prescriptions",
            //     icon: Pill,
            //     color: "text-blue-500",
            // },
        ],
    },
    {
        title: "Products & Services",
        icon: FlaskConical,
        allowedRoles: ["Administrator", "Super Admin", "Clinic Admin"],
        items: [
            // {
            //     href: "/billing",
            //     label: "Billing",
            //     icon: FileText,
            //     color: "text-purple-500",
            //     allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            // },
            // {
            //     href: "/reports",
            //     label: "Reports",
            //     icon: PieChart,
            //     color: "text-purple-500",
            //     allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            // },
            {
                href: "/inventory",
                label: "Inventory",
                icon: Package,
                color: "text-purple-500",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin"],
            },
            {
                href: "/products",
                label: "Products",
                icon: Package,
                color: "text-purple-500",
                allowedRoles: ["Administrator", "Super Admin"],
            },
            // {
            //   href: "/dashboard/shipments",
            //   label: "Shipments",
            //   icon: Database,
            //   color: "text-purple-500",
            // },
        ],
    },
    {
        title: "Administration",
        icon: Settings2,
        allowedRoles: ["Administrator", "Super Admin"],
        items: [
            {
                href: "/clinic",
                label: "Clinics",
                icon: Building,
                color: "text-purple-500",
                allowedRoles: ["Administrator", "Super Admin"],
            },
            {
                href: "/users",
                label: "Users",
                icon: Users,
                color: "text-purple-500",
                allowedRoles: ["Administrator", "Super Admin"],
            },
           
            {
                href: "/supplier",
                label: "Suppliers",
                icon: Users,
                color: "text-purple-500",
                allowedRoles: ["Administrator", "Super Admin"],
            }
        ],
    }
    // },
    // {
    //     title: "Settings",
    //     icon: Settings2,
    //     items: [
    //         {
    //             href: "/settings",
    //             label: "Settings",
    //             icon: Settings,
    //             color: "text-green-500",
    //         },
    //     ],
    // },
]