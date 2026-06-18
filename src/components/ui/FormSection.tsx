import React from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
    title?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    id?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
    title, 
    icon: Icon, 
    children, 
    id
}) => {
    return (
        <section className="relative group" id={id ? `${id}-section` : undefined}>
            <div className="flex flex-wrap items-center gap-2 mb-3 pl-1">
                {Icon && <Icon size={18} className="text-ios-primary/90" aria-hidden="true" />}
                {title !== undefined && title !== null && title !== "" && (
                    <h2 
                        id={id}
                        className="text-label font-semibold tracking-[0.18em] uppercase text-ios-foreground-muted transition-colors group-hover:text-ios-foreground"
                    >
                        {title}
                    </h2>
                )}
            </div>
            <div className="w-full">
                {children}
            </div>
        </section>
    );
};
