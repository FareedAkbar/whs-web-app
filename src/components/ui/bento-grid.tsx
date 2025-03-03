import { cn } from "@/lib/utils";
import { BackgroundGradient } from "./background-gradient";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  active,
  typeString,
  difficulty,
  source,
  category,
  progress,
  score,
  color,
  compact,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  active: boolean;
  typeString?: string;
  difficulty?: string;
  source?: string;
  color?: string;
  category?: string;
  progress?: number;
  score?: number;
  compact?: boolean;
  onClick?: () => void;
}) => {
  return (
    !compact ?
      <BackgroundGradient onClick={onClick} className={cn(
        "flex h-full w-full rounded-[8px] group/bento hover:shadow-xl transition overflow-hidden duration-200 shadow-input dark:shadow-none backdrop-blur-lg bg-white dark:bg-[#0A0A0A] justify-start flex-col space-y-4 shadow-md",
        className
      )}>
        <div className="flex flex-col relative">
          <div className="absolute bottom-0 right-0 flex items-center justify-center text-white font-semibold text-sm p-2">
            {progress?.toFixed(0) ?? 0}%
          </div>
          <div className={"flex justify-center items-center w-full h-56 p-4" + (color ?? "")}>
            {header}
          </div>
          <div className="w-full bg-[#9FEF00]/30 h-1">
            <div className="h-1 bg-[#9FEF00] transition-all duration-300" style={{ width: `${progress ?? 0}%` }}></div>
          </div>
        </div>
        <div className="group-hover/bento:translate-x-2 transition duration-200 p-3 pt-1 h-fit w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {icon} <p className="text-xs dark:text-neutral-400 text-neutral-800">{category}</p>
            </div>
            <div className="flex items-center gap-1">
              {
                active && <div className="dark:bg-[#9FEF00]/20 bg-[#9FEF00]/30 px-4 py-2 rounded-full text-xs font-normal dark:text-[#9FEF00] text-[#658c19] transition flex gap-2 justify-center items-center w-fit">
                  Active
                </div>
              }
              {
                score && <div className=" text-nowrap dark:bg-teal-400/10 bg-teal-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-teal-400 text-teal-800 transition flex gap-2 justify-center items-center w-fit">
                  {score} Points
                </div>
              }
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 w-full">
              {
                typeString && <div className="dark:bg-purple-400/10 bg-purple-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-purple-400 text-purple-800 transition flex gap-2 justify-center items-center w-fit">
                  {typeString}
                </div>
              }
              {
                difficulty && <div className="dark:bg-yellow-400/10 bg-yellow-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-yellow-400 text-yellow-800 transition flex gap-2 justify-center items-center w-fit">
                  {difficulty}
                </div>
              }
              {
                source && <div className="dark:bg-orange-400/10 bg-orange-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-orange-400 text-orange-800 transition flex gap-2 justify-center items-center w-fit">
                  {source}
                </div>
              }
            </div>
          </div>
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
            {title}
          </div>
          <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {description}
          </div>
        </div>
      </BackgroundGradient>
      :
      <div onClick={onClick} className={cn(
        "flex h-full w-full rounded-[8px] group/bento hover:shadow-xl transition overflow-hidden duration-200 shadow-input backdrop-blur-lg bg-white dark:bg-[#0A0A0A] justify-start flex-col space-y-4 border border-black/[0.1] dark:border-white/[0.2] shadow-md",
        className
      )}>
        <div className="flex flex-col relative">
          <div className="absolute bottom-0 right-0 flex items-center justify-center text-white font-semibold text-sm p-2">
            {progress?.toFixed(0) ?? 0}%
          </div>
          <div className={"flex justify-center items-center w-full h-56 p-4" + (color ?? "")}>
            {header}
          </div>
          <div className="w-full bg-[#9FEF00]/30 h-1">
            <div className="h-1 bg-[#9FEF00] transition-all duration-300" style={{ width: `${progress ?? 0}%` }}></div>
          </div>
        </div>
        <div className="group-hover/bento:translate-x-2 transition duration-200 p-3 pt-1 h-fit w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              {icon} <p className="text-xs dark:text-neutral-400 text-neutral-800">{category}</p>
            </div>
            <div className="flex items-center gap-1">
              {
                active && <div className="dark:bg-[#9FEF00]/20 bg-[#9FEF00]/30 px-4 py-2 rounded-full text-xs font-normal dark:text-[#9FEF00] text-[#658c19] transition flex gap-2 justify-center items-center w-fit">
                  Active
                </div>
              }
              {
                score && <div className=" text-nowrap dark:bg-teal-400/10 bg-teal-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-teal-400 text-teal-800 transition flex gap-2 justify-center items-center w-fit">
                  {score} Points
                </div>
              }
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 w-full">
              {
                typeString && <div className="dark:bg-purple-400/10 bg-purple-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-purple-400 text-purple-800 transition flex gap-2 justify-center items-center w-fit">
                  {typeString}
                </div>
              }
              {
                difficulty && <div className="dark:bg-yellow-400/10 bg-yellow-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-yellow-400 text-yellow-800 transition flex gap-2 justify-center items-center w-fit">
                  {difficulty}
                </div>
              }
              {
                source && <div className="dark:bg-orange-400/10 bg-orange-400/30 px-4 py-2 rounded-full text-xs font-normal dark:text-orange-400 text-orange-800 transition flex gap-2 justify-center items-center w-fit">
                  {source}
                </div>
              }
            </div>
          </div>
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
            {title}
          </div>
          <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {description}
          </div>
        </div>
      </div>

  );
};
