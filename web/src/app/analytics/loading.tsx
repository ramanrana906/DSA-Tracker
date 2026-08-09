export default function Loading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse p-4">
      <div className="h-20 bg-slate-100 rounded-lg w-full mb-4"></div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="h-32 bg-slate-100 rounded-lg"></div>
        <div className="h-32 bg-slate-100 rounded-lg"></div>
        <div className="h-32 bg-slate-100 rounded-lg"></div>
        <div className="h-32 bg-slate-100 rounded-lg"></div>
      </div>

      <div className="flex gap-6 mt-6">
        <div className="flex-1 h-96 bg-slate-100 rounded-lg"></div>
        <div className="w-1/3 h-96 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  );
}
