import { Loader2 } from 'lucide-react';

interface LoaderProps {
    text?: string;
    fullScreen?: boolean;
    size?: number;
    className?: string;
}

export function Loader({ text = 'Loading...', fullScreen = false, size = 24, className = '' }: LoaderProps) {
    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 text-zinc-500 ${className}`}>
            <Loader2 className="animate-spin text-zinc-900" style={{ width: size, height: size }} />
            {text && <p className="text-sm font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
