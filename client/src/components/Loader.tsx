export function Loader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 flex space-x-2">
        <div className="w-2 h-full bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-full bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-full bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}
