import useAutoScroll from '@/hooks/useAutoScroll';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';

export default function ChatMessages({messages, isLoading }) {
    const scrollContentRef = useAutoScroll(isLoading);

    return (
        <div ref={scrollContentRef} className="grow space-y-4">
            {messages.map((msg, i) => (
                <div key={i}>
                    {msg.role === 'assistant' ? (
                        <AssistantMessage content={msg.content} />
                    ) : (
                        <UserMessage content={msg.content} />
                    )}
                </div>
            ))}
        </div>
    );
}