export default function Logo({ className = "w-40 h-10", title, subtitle }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col justify-center">
        <span className="font-serif text-2xl tracking-widest text-black uppercase">
          {title || "SEASONS"}
        </span>
        <span className="font-sans text-[0.6rem] tracking-[0.3em] text-gray-500 uppercase text-center -mt-1">
          {subtitle || "BY RITU"}
        </span>
      </div>
    </div>
  );
}
