import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    toastOptions={{ classNames: { toast: "glass-strong !rounded-2xl !text-foreground !border-border" } }}
    {...props}
  />
);

export { Toaster };
