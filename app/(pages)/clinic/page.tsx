import Clinic from "@/components/clinic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinic",
};

async function Page({
  searchParams,
}  : {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
    const { cookies } = await import("next/headers")
    return <Clinic />;
}

export default Page



