
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, AlertTriangle, Check, Trash2, X } from "lucide-react";
import { Button } from "../ui/forms/button";
import { cn } from "../ui/utils";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    variant = 'default',
    isLoading = false,
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setVisible(false);
                document.body.style.overflow = 'unset';
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, isLoading, onClose]);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) return;
        await onConfirm();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    if (!isMounted || (!isOpen && !visible)) return null;

    const iconColor = variant === 'danger' ? 'text-red-500' : 'text-emerald-500';
    const iconBg = variant === 'danger' ? 'bg-red-50' : 'bg-emerald-50';
    const buttonVariant = variant === 'danger' ? 'destructive' : 'default';

    return createPortal(
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-in-out",
                isOpen ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
            )}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
        >
            <div
                className={cn(
                    "bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center transform transition-all duration-300",
                    // FORCE EXACT WIDTH: 350px fixed width, but max 90% of screen width for small mobiles
                    "w-[350px] max-w-[90vw]",
                    isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <div className="flex flex-col items-center text-center p-6 w-full">
                    {/* Icon Circle */}
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 mt-2 shadow-sm", iconBg)}>
                        {variant === 'danger' ? (
                            <Trash2 className={cn("w-8 h-8", iconColor)} />
                        ) : (
                            <Check className={cn("w-8 h-8 stroke-[3]", iconColor)} />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2 px-4 leading-tight">
                        {title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 px-2">
                        {description}
                    </p>

                    {/* Action Buttons Stack */}
                    <div className="flex flex-col gap-3 w-full">
                        <Button
                            variant={buttonVariant}
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={cn(
                                "w-full font-bold shadow-md active:scale-95 transition-all h-11 rounded-xl text-sm",
                                variant === 'danger'
                                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                            )}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {confirmText}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 h-11 rounded-xl text-sm"
                        >
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
