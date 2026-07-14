export default function LogoSVG({
  className = "w-10 h-10",
}: {
  className?: string;
}) {
  return (
    // <svg viewBox="0 0 150 150" className={className} fill="none">
    //   <rect width="150" height="150" rx="12" fill="#2D3836" />
    //   <path d="M35 115L65 35L95 115" stroke="#F5E6D3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    //   <path d="M55 115L85 35L115 115" stroke="#C4B5A0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    //   <path d="M45 85L75 85" stroke="#F5E6D3" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    // </svg>
    <img className={className} src="/logo-arq.jpg" alt="Logo"></img>
  );
}
