"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
  activeTab?: string
  onTabChange?: (value: string) => void
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  activeTab?: string
  onTabChange?: (value: string) => void
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  activeTab?: string
}

const Tabs: React.FC<TabsProps> = ({ defaultValue = "", children, className }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child

    return React.cloneElement(child as React.ReactElement<TabsListProps | TabsContentProps>, {
      activeTab,
      onTabChange: handleTabChange
    })
  })

  return (
    <div className={className}>
      {childrenWithProps}
    </div>
  )
}

const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, onTabChange }) => {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child

    return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
      activeTab,
      onTabChange
    })
  })

  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {childrenWithProps}
    </div>
  )
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, activeTab, onTabChange }) => {
  const isActive = activeTab === value

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={() => onTabChange?.(value)}
    >
      {children}
    </button>
  )
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, activeTab }) => {
  if (activeTab !== value) return null

  return (
    <div className={cn("mt-2", className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }