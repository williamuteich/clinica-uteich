"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";
import { useSession } from "next-auth/react";
import { SkeletonSidebar } from "../sidebar";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                        <Menu className="w-6 h-6" />
                    </Button>
                }
            />
            <SheetContent side="left" className="p-0 w-72 border-none">
                {open && (
                    session ? (
                        <SidebarContent session={session} onClose={() => setOpen(false)} />
                    ) : (
                        <SkeletonSidebar />
                    )
                )}
            </SheetContent>
        </Sheet>
    );
}
