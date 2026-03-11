import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './dialog';

interface StandardModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export function StandardModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'md',
}: StandardModalProps) {
    // Map standard tailwind max-width classes for the modal content
    const maxWidthClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        '6xl': 'sm:max-w-6xl',
        '7xl': 'sm:max-w-7xl',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${maxWidthClasses[maxWidth]} bg-white border-zinc-200 shadow-xl p-0 overflow-hidden`}>
                <DialogHeader className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                    <DialogTitle className="text-lg font-semibold text-zinc-900">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-zinc-500 mt-1">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="p-6">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
