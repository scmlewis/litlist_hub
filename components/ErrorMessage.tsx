export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
      <p className="font-medium">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
