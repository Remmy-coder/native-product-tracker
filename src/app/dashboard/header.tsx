"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getPathSegments = () => {
    return pathname.split("/").filter((segment) => segment);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-black bg-opacity-90 px-4">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {getPathSegments().map((value, index: number) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <p className="capitalize">{value}</p>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
