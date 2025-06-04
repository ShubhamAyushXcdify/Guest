import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Define the type for breadcrumb items
type BreadcrumbItem = {
  label: string
  href: string
}

// Define the type for path mapping
type PathMapping = {
  [key: string]: BreadcrumbItem[]
}

// Define the path mappings
const pathMappings: PathMapping = {
  "/": [
    { label: "Home", href: "/" }
  ],
  "/dashboard": [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" }
  ],
  "/dashboard/ports": [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Ports", href: "/dashboard/ports" }
  ],
  // Add more path mappings as needed
}

// Function to format segment names for display
const formatSegmentName = (segment: string, index: number, segments: string[]): string => {
  // Check if this might be a clinic ID (UUIDs are typically 36 chars)
  if (segment.length > 30 && segment.includes('-')) {
    // If previous segment is "clinic", don't repeat "Clinic" word
    if (index > 0 && segments[index-1].toLowerCase() === "clinic") {
      // Return nothing - we'll filter this out
      return "";
    }
    return "Clinic";
  }
  
  // For tabs within the clinic section
  if (['rooms', 'slots', 'doctors', 'users'].includes(segment)) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  
  // Default capitalization for other segments
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Get the breadcrumb items for the current path
  const breadcrumbItems = pathMappings[pathname] || []

  // Split the pathname into segments and create the breadcrumb items
  const segments = pathname.split('/').filter(Boolean)
  const visibleSegments = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const name = formatSegmentName(segment, index, segments)
    return {
      name,
      path
    }
  }).filter(segment => segment.name !== "") // Filter out empty segment names

  return (
    <Breadcrumb className="text-sm text-muted-foreground">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => router.push('/')}>Home</BreadcrumbLink>
        </BreadcrumbItem>

        {visibleSegments.map((segment, index) => {
          const isLast = index === visibleSegments.length - 1;
          
          return (
            <React.Fragment key={segment.path}>
              <BreadcrumbSeparator className='text-primary' />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => router.push(segment.path)}>
                    {segment.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 