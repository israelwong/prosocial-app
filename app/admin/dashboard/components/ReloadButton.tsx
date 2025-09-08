'use client'

interface ReloadButtonProps {
    onReload?: () => void
}

export function ReloadButton({ onReload }: ReloadButtonProps) {
    const handleReload = () => {
        if (onReload) {
            onReload()
        } else {
            window.location.reload()
        }
    }

    return (
        <button
            onClick={handleReload}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-bold py-2 px-4 rounded transition-colors border border-zinc-600"
        >
            Recargar página
        </button>
    )
}
