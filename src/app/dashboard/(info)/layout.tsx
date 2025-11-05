export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-3 py-5">
        {/* <h1 className="mb-10 text-center text-3xl font-bold text-primary">
          Information Center
        </h1> */}
        <div className="space-y-6 rounded-2xl bg-white p-8 leading-relaxed shadow-lg dark:bg-gray-800 dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
