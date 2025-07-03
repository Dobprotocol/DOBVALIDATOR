"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleSidebarProps {
  children: React.ReactNode
  className?: string
}

interface SimpleSidebarContentProps {
  children: React.ReactNode
  className?: string
}

interface SimpleSidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

interface SimpleSidebarMenuProps {
  children: React.ReactNode
  className?: string
}

interface SimpleSidebarMenuButtonProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const SimpleSidebar = React.forwardRef<HTMLDivElement, SimpleSidebarProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col border-r bg-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SimpleSidebar.displayName = "SimpleSidebar"

const SimpleSidebarHeader = React.forwardRef<HTMLDivElement, SimpleSidebarHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-16 items-center px-4 border-b", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SimpleSidebarHeader.displayName = "SimpleSidebarHeader"

const SimpleSidebarContent = React.forwardRef<HTMLDivElement, SimpleSidebarContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SimpleSidebarContent.displayName = "SimpleSidebarContent"

const SimpleSidebarMenu = React.forwardRef<HTMLDivElement, SimpleSidebarMenuProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1 p-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SimpleSidebarMenu.displayName = "SimpleSidebarMenu"

const SimpleSidebarMenuButton = React.forwardRef<HTMLButtonElement, SimpleSidebarMenuButtonProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <>{children}</>
    }
    return (
      <Button
        ref={ref}
        className={cn("w-full justify-start", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
SimpleSidebarMenuButton.displayName = "SimpleSidebarMenuButton"

export {
  SimpleSidebar,
  SimpleSidebarHeader,
  SimpleSidebarContent,
  SimpleSidebarMenu,
  SimpleSidebarMenuButton,
} 