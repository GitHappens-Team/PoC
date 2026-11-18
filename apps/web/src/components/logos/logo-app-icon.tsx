import type { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogoAppIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Your App"
    data-placeholder="true"
    aria-labelledby={titleId}
    {...props}
  >
    {title === undefined ? (
      <title id={titleId}>{"Your App"}</title>
    ) : title ? (
      <title id={titleId}>{title}</title>
    ) : null}
    <rect width={64} height={64} rx={14} fill="var(--logo-bg, #151070)" />
    <path
      d="M32 4C35 22 42 29 60 32C42 35 35 42 32 60C29 42 22 35 4 32C22 29 29 22 32 4Z"
      fill="var(--logo-glyph, #efeffb)"
      transform="translate(14 14) scale(0.56)"
    />
  </svg>
);
export default SvgLogoAppIcon;
