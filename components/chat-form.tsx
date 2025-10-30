"use client";

import { ArrowUpIcon } from "lucide-react";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import LoadingIcon from "@/assets/icon/LoadingIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";

const ChatMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  model_tag: z.string().optional(),
});

type ChatMessageForm = z.infer<typeof ChatMessageSchema>;

type Message = {
  user_id: string;
  model_tag: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

const INITIAL_MESSAGE: Message = {
  user_id: "system",
  model_tag: "",
  role: "assistant",
  content: "Welcome! 👋 Start the conversation by sending a message.",
  created_at: new Date().toISOString(),
};

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";
  const bubbleBg = isUser
    ? "bg-sky-50 text-sky-900 dark:bg-sky-900/20 dark:text-sky-100"
    : "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/10 dark:text-emerald-100";
  const containerClasses = isUser ? "flex w-full justify-end px-2" : "flex w-full justify-start px-2";
  const radiusClass = isUser
    ? "rounded-tl-lg rounded-bl-lg rounded-tr-lg"
    : "rounded-tr-lg rounded-br-lg rounded-tl-lg";

  if (message.role === "system" && message.content === "typing") {
    return <TypingIndicator key={`${message.user_id}-${index}-${message.created_at}`} />;
  }

  return (
    <div key={`${message.user_id}-${index}-${message.created_at}`} className={containerClasses}>
      <div className={`max-w-[72%] ${bubbleBg} ${radiusClass} p-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium">
            {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : "System"}
            {message.model_tag && <span className="text-muted-foreground ml-2 text-xs">· {message.model_tag}</span>}
          </div>
          <div className="text-muted-foreground text-xs">{new Date(message.created_at).toLocaleTimeString()}</div>
        </div>
        <div className="mt-2 text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}

function ChatInput({
  isSubmitting,
  isLoadingModels,
  model,
  models,
  modelsError,
  errors,
  register,
  handleSubmit,
  onSubmit,
  setModel,
}: {
  isSubmitting: boolean;
  isLoadingModels: boolean;
  model: string;
  models: Array<{ tag: string }> | undefined;
  modelsError: unknown | null;
  errors: any;
  register: any;
  handleSubmit: any;
  onSubmit: any;
  setModel: (model: string) => void;
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-6xl">
      <InputGroup className="flex items-end gap-2">
        <InputGroupTextarea
          placeholder="Ask, Search or Chat..."
          {...register("content")}
          aria-invalid={!!errors.content}
          className="max-h-6 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        <InputGroupAddon align="block-end" className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="outline" type="button" disabled={isLoadingModels}>
                {isLoadingModels ? (
                  <span className="flex items-center gap-2">
                    <LoadingIcon className="h-4 w-4" />
                    Loading...
                  </span>
                ) : (
                  model
                )}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="[--radius:0.95rem]">
              {modelsError ? (
                <DropdownMenuItem disabled>Error loading models</DropdownMenuItem>
              ) : (
                models?.map((m) => (
                  <DropdownMenuItem key={m.tag} onClick={() => setModel(m.tag)}>
                    {m.tag}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <InputGroupText className="invisible ml-auto">Model</InputGroupText>
          <Separator orientation="vertical" className="h-6!" />
          <InputGroupButton
            variant="default"
            className="rounded-full"
            size="icon-xs"
            type="submit"
            disabled={isSubmitting || isLoadingModels}
          >
            {isSubmitting ? <LoadingIcon className="h-4 w-4" /> : <ArrowUpIcon />}
            <span className="sr-only">{isSubmitting ? "Sending..." : "Send"}</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {errors.content && <div className="text-destructive mt-2 text-sm">{errors.content.message}</div>}
    </form>
  );
}

export default function ChatForm() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [model, setModel] = React.useState<string>("gpt-4o");
  const [hasInitialized, setHasInitialized] = React.useState(false);

  const { data: models, isLoading: isLoadingModels, error: modelsError } = trpc.models.getAvailable.useQuery();
  const { data: chatHistory, isLoading: isLoadingHistory, error: historyError } = trpc.chat.history.useQuery();

  const bottomRef = React.useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ChatMessageForm>({
    resolver: zodResolver(ChatMessageSchema),
    defaultValues: {
      content: "",
      model_tag: model,
    },
  });

  React.useEffect(() => {
    reset({ content: "", model_tag: model });
  }, [model, reset]);

  // Auto scroll to bottom on new messages with debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 70);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  const sendMessage = trpc.chat.send.useMutation({
    onMutate: () => {
      setMessages((prev) => [
        ...prev,
        {
          user_id: "assistant-1",
          model_tag: model,
          role: "system",
          content: "typing",
          created_at: new Date().toISOString(),
        },
      ]);
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          user_id: "assistant-1",
          model_tag: model,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  React.useEffect(() => {
    if (isLoadingHistory) {
      setMessages([]);
    } else if (historyError) {
      setMessages([
        {
          user_id: "system",
          model_tag: "",
          role: "system",
          content: "Failed to load chat history. Please refresh the page.",
          created_at: new Date().toISOString(),
        },
      ]);
    } else if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
      setHasInitialized(true);
    } else if (!hasInitialized) {
      setMessages([INITIAL_MESSAGE]);
      setHasInitialized(true);
    }
  }, [chatHistory, isLoadingHistory, historyError, hasInitialized]);

  async function onSubmit(values: ChatMessageForm) {
    const newMsg: Message = {
      user_id: "user-1",
      model_tag: values.model_tag ?? model,
      role: "user",
      content: values.content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    reset({ content: "", model_tag: model });

    try {
      await sendMessage.mutateAsync({
        modelTag: newMsg.model_tag,
        prompt: values.content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.slice(0, -1));
    }
  }

  return (
    <>
      <div className="bg-background flex h-full w-full flex-col justify-between">
        <div className="h-full max-h-[calc(100vh-13rem)] overflow-y-scroll">
          <div className="mx-auto flex h-full min-h-[calc(100vh-13rem)] max-w-6xl flex-1 flex-col gap-3 py-6">
            {isLoadingHistory && (
              <div className="sticky top-0 flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <LoadingIcon className="text-primary h-8 w-8" />
                  <span className="text-muted-foreground text-sm">Loading chat history...</span>
                </div>
              </div>
            )}

            {messages.length === 0 && !isLoadingHistory && (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <p className="text-lg font-semibold">Welcome!</p>
                  <p className="text-sm">Start the conversation by sending a message.</p>
                </div>
              </div>
            )}

            {messages
              .filter(
                (m) => m.role === "user" || m.role === "assistant" || (m.role === "system" && m.content === "typing"),
              )
              .map((m, i) => (
                <MessageBubble key={`${m.user_id}-${i}-${m.created_at}`} message={m} index={i} />
              ))}
          </div>
          <div
            ref={bottomRef}
            style={{
              height: 20,
              width: "100%",
              visibility: "hidden", // Hide the scroll anchor
              scrollBehavior: "smooth",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="bg-background/80 h-full w-full border p-4 shadow-2xl backdrop-blur-sm">
          <ChatInput
            isSubmitting={isSubmitting}
            isLoadingModels={isLoadingModels}
            model={model}
            models={models}
            modelsError={modelsError}
            errors={errors}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            setModel={setModel}
          />
        </div>
      </div>
    </>
  );
}
