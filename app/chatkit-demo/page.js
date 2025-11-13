import ChatKitContainer from "@/components/chatkit/ChatKitContainer";


export const metadata = {
  title: 'ChatKit Demo',
};

export default function ChatKitDemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          ChatKit integration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use this page to validate the ChatKit backend connection and understand how to embed the ChatKit React package throughout the application.
        </p>
      </div>
      <ChatKitContainer />
    </main>
  );
}
