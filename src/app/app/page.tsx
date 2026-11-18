import { Brand } from "@/components/Brand";
import { AssistantApp } from "@/features/conversation/AssistantApp";

export const metadata = { title: "Assistant — Signal Vessel", description: "Explore voice, vision, research, writing and coaching in a public multimodal AI assistant.", alternates: { canonical: "/app" }, robots: { index: true, follow: true } };

export default function AppPage() {
  return <main className="assistant-page"><a className="skip-link" href="#conversation">Skip to conversation</a><AssistantApp brand={<Brand compact />} /></main>;
}
