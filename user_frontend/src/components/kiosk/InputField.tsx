 import * as React from "react";
 import { cn } from "@/lib/utils";
 import { LucideIcon } from "lucide-react";
 import { Mic, Keyboard } from "lucide-react";
 import { VirtualKeyboard } from "./VirtualKeyboard";
 import { useSpeechInput } from "@/hooks/useSpeechInput";
 
 interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
   label?: string;
   error?: string;
   icon?: LucideIcon;
   helperText?: string;
 }
 
 const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
   ({ className, label, error, icon: Icon, helperText, id, type, value, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [keyboardOpen, setKeyboardOpen] = React.useState(false);
    const { listening, startListening, stopListening } = useSpeechInput();
    const inputType = type || "text";
    const mode = inputType === "number" ? "numeric" : "alphanumeric";
    const currentValue = typeof value === "string" ? value : "";
    const handleValueChange = (next: string) => {
      if (onChange) {
        const e = { target: { value: next } } as React.ChangeEvent<HTMLInputElement>;
        onChange(e);
      }
    };
 
     return (
       <div className="w-full space-y-2">
         {label && (
           <label
             htmlFor={inputId}
             className="block text-kiosk-lg font-medium text-foreground"
           >
             {label}
           </label>
         )}
         <div className="relative">
           {Icon && (
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
               <Icon className="w-6 h-6" />
             </div>
           )}
           <input
             ref={ref}
             id={inputId}
             className={cn(
               "flex h-16 w-full rounded-lg",
               "border-2 border-input bg-background",
               "px-5 py-4 text-kiosk-lg",
              "pr-24",
               "ring-offset-background",
               "placeholder:text-muted-foreground",
               "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
               "disabled:cursor-not-allowed disabled:opacity-50",
               "transition-all duration-200",
               Icon && "pl-14",
               error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
               className
             )}
             type={inputType}
             value={value}
             onChange={onChange}
             {...props}
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <button
               type="button"
               className="h-10 w-10 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
               onClick={() => {
                 if (listening) {
                   stopListening();
                 } else {
                   startListening((text) => handleValueChange((currentValue + " " + text).trim()));
                 }
               }}
             >
               <Mic className="w-5 h-5" />
             </button>
             <button
               type="button"
               className="h-10 w-10 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
               onClick={() => setKeyboardOpen((v) => !v)}
             >
               <Keyboard className="w-5 h-5" />
             </button>
           </div>
         </div>
         {helperText && !error && (
           <p className="text-kiosk-sm text-muted-foreground">{helperText}</p>
         )}
         {error && (
           <p className="text-kiosk-sm text-destructive font-medium">{error}</p>
         )}
         <VirtualKeyboard
           visible={keyboardOpen}
           value={currentValue}
           mode={mode}
           onChange={handleValueChange}
           onClose={() => setKeyboardOpen(false)}
           label={label}
         />
       </div>
     );
   }
 );
 
 InputField.displayName = "InputField";
 
 export { InputField };
