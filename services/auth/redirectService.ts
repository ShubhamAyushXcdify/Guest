type user = {
    id: string,
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    roleName: string,
    roleId: string,
    clinicId: string | null,
    clinicName: string | null,
    clinic: string | null,
    isActive: boolean,
    lastLogin: string | null,
    createdAt: string,
    updatedAt: string
}

export function getRedirectUrl(user: user) {
    if (user.roleName.toLocaleLowerCase().includes("client")) {
        return "/patientdashboard"
    }

    return "/dashboard"
}

