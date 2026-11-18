import type { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogoStacked = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 186 116"
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
    <path
      d="M32 4C35 22 42 29 60 32C42 35 35 42 32 60C29 42 22 35 4 32C22 29 29 22 32 4Z"
      fill="currentColor"
      transform="translate(61 0)"
    />
    <text
      x={93}
      y={108}
      fontSize={40}
      textAnchor="middle"
      fontFamily="'Baloo 2', 'Trebuchet MS', system-ui, sans-serif"
      fontWeight={700}
    >
      <tspan fill="var(--logo-wordmark, currentColor)">{"Your"}</tspan>
      <tspan fill="var(--logo-accent, currentColor)">{"\xA0App"}</tspan>
    </text>
  </svg>
);
export default SvgLogoStacked;
