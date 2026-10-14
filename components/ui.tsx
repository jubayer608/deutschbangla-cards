import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders an anchor instead of a button. */
  href?: string;
  /** Appends a nudging arrow (uses .btn-arrow). */
  arrow?: boolean;
  children: ReactNode;
}

const buttonSizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

/** Shared button — styling comes from the .btn contract classes in globals.css. */
export function Button({
  variant = "primary",
  size = "md",
  href,
  arrow = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `btn btn-${variant} ${buttonSizeClass[size]} ${arrow ? "btn-arrow" : ""} ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={classes}>
        <span>{children}</span>
        {arrow && <ArrowRight className="h-4 w-4" aria-hidden />}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4" aria-hidden />}
    </button>
  );
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift treatment (.card-hover). */
  hover?: boolean;
  children: ReactNode;
}

/** Shared card — styling comes from the .card contract class in globals.css. */
export function Card({ hover = false, className = "", children, ...rest }: CardProps) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

type BadgeTone = "default" | "teal" | "navy" | "sun";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const badgeToneClass: Record<BadgeTone, string> = {
  default: "bg-cream text-navy",
  teal: "bg-teal/10 text-teal",
  navy: "bg-navy text-white",
  sun: "bg-sun/20 text-navy",
};

/** Small pill label — base shape from .badge, tone from the brand palette. */
export function Badge({ tone = "default", className = "", children, ...rest }: BadgeProps) {
  return (
    <span className={`badge ${badgeToneClass[tone]} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress as a fraction, 0..1 */
  value: number;
  /** Optional label shown above the bar. */
  label?: string;
  /** Show the percentage next to the label. */
  showPercent?: boolean;
}

/** Horizontal progress bar — track/fill from .progress-track / .progress-fill. */
export function ProgressBar({
  value,
  label,
  showPercent = false,
  className = "",
  ...rest
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <div className={className} {...rest}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          {label ? <span className="font-bangla text-navy">{label}</span> : <span />}
          {showPercent && (
            <span className="font-heading tabular-nums text-navy">{percent}%</span>
          )}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: ReactNode;
  /** Bangla subtitle slot rendered under the title. */
  subtitle?: ReactNode;
  align?: "left" | "center";
}

/** Section header: eyebrow + Poppins title + optional Bangla subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
  ...rest
}: SectionHeadingProps) {
  return (
    <div
      className={`section-heading ${align === "center" ? "text-center" : ""} ${className}`.trim()}
      {...rest}
    >
      {eyebrow && (
        <p className="font-heading text-xs font-bold uppercase tracking-widest text-teal">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="font-bangla mt-2 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
