// Shared types for Hero components

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
export type TextAlignment = 'left' | 'center' | 'right'

export interface ButtonConfig {
    text: string
    href?: string
    onClick?: () => void
    variant?: ButtonVariant
    size?: ButtonSize
    target?: '_blank' | '_self'
    fullWidth?: boolean
    withBorder?: boolean
    className?: string
}

export interface BaseHeroProps {
    title: string
    subtitle?: string
    description?: string
    buttons?: ButtonConfig[]
    textAlignment?: TextAlignment
    className?: string
    contentMaxWidth?: string
    minHeight?: string
}
