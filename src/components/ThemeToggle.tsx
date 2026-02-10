"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    if (!mounted) return <div className="p-2 w-9 h-9" />

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme("light")
        } else if (theme === "light") {
            setTheme("dark")
        } else {
            setTheme("system")
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-full hover:bg-muted/50 transition-all duration-300 transform active:scale-95"
            title={`Current: ${theme}. Click to cycle.`}
        >
            {theme === "system" ? (
                <Monitor className="h-[1.2rem] w-[1.2rem] text-muted-foreground animate-in fade-in zoom-in duration-300" />
            ) : resolvedTheme === "dark" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400 animate-in spin-in-90 fade-in zoom-in duration-300" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 animate-in spin-in-90 fade-in zoom-in duration-300" />
            )}
        </button>
    )
}
