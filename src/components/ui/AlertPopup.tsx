import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

type AlertVariant = "default" | "success" | "error";

interface AlertPopupProps {
  title: string;
  description: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  variant?: AlertVariant;
}

export function AlertPopup({
  title,
  description,
  isOpen,
  setIsOpen,
  variant = "default",
}: AlertPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setIsOpen]);

  const getColorClasses = () => {
    switch (variant) {
      case "success":
        return "bg-default-foreground text-white border-green-300";
      case "error":
        return "bg-default-foreground text-white font-bold border-red-300";
      default:
        return "bg-default text-white border-gray-300";
    }
  };

  return (
    isOpen && (
      <div className={`fixed bottom-4 md:right-4 right-1 bg-secondary z-50 w-96 rounded-md border shadow-lg py-2 px-4 ${getColorClasses()}`}>
        <Alert  className="shadow-none bg-transparent border-none p-0">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    )
  );
}
