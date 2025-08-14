import { ClipboardList, LayoutDashboard, Calendar, Users, Package, FlaskConical, FileText, PieChart, Settings2, Building, DoorOpen, UserCheck, Stethoscope, Clock } from "lucide-react"

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
                color: "text-blue-2000",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Receptionist", "Veterinarian"],
            },
            {
                href: "/appointments/confirmed",
                label: "Appointments",
                icon: Calendar,
                color: "text-blue-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Receptionist", "Veterinarian"],
                activePaths: ["/appointments/confirmed", "/appointments/queue"],
            },
            {
                href: "/patients",
                label: "Patients",
                icon: Users,
                color: "text-blue-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Receptionist", "Veterinarian"],
            },
            {
                href: "/clients",
                label: "Clients",
                icon: Users,
                color: "text-blue-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Receptionist", "Veterinarian"],
                activePaths: [],
            },
        ],
    },
    {
        title: "Products & Services",
        icon: FlaskConical,
        allowedRoles: ["Administrator", "Clinic Admin", "Veterinarian"],
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
                color: "text-purple-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Veterinarian"],
            },
            {
                href: "/products",
                label: "Products",
                icon: Package,
                color: "text-purple-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Veterinarian"],
            }
        ],
    },
    {
        title: "Administration",
        icon: Settings2,
        allowedRoles: ["Administrator", "Super Admin", "Clinic Admin", "Veterinarian"],
        items: [
//add companies
            {
                href: "/companies",
                label: "Companies",
                icon: Building,
                color: "text-purple-2000",
                allowedRoles: ["Super Admin"],
            },

            {
                href: "/clinic",
                label: "Clinics",
                icon: Building,
                color: "text-purple-2000",
                allowedRoles: ["Administrator"],
                activePaths: ["/clinic"],
                dynamicPaths: ["/clinic/[id]", "/clinic/[id]/rooms", "/clinic/[id]/appointmentType", "/clinic/[id]/users", "/clinic/[id]/doctors","/clinic/[id]/doctors/slots/[doctorId]"],
            },
            {
                href: "/users",
                label: "Users",
                icon: Users,
                color: "text-purple-2000",
                allowedRoles: ["Administrator", "Super Admin", "Clinic Admin"],
            },
            {
                href: "/supplier",
                label: "Suppliers",
                icon: Users,
                color: "text-purple-2000",
                allowedRoles: ["Administrator", "Clinic Admin", "Veterinarian"],
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
    //             color: "text-green-2000",
    //         },
    //     ],
    // },
]

// Helper function to check if current path matches dynamic routes
export const isPathActive = (pathname: string, item: any): boolean => {
    // Check exact href match
    if (pathname === item.href) return true;
    
    // Check activePaths array
    if (item.activePaths && item.activePaths.includes(pathname)) return true;
    
    // Check dynamic paths for clinic routes
    if (item.dynamicPaths) {
        return item.dynamicPaths.some((dynamicPath: string) => {
            // Convert dynamic path pattern to regex
            const regexPattern = dynamicPath
                .replace(/\[id\]/g, '[a-f0-9-]{36}') // UUID pattern
                .replace(/\[doctorId\]/g, '[a-f0-9-]{36}') // UUID pattern for doctorId
                .replace(/\//g, '\\/');
            
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(pathname);
        });
    }
    
    return false;
};
