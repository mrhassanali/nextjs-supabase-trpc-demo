"use client";

import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon } from "lucide-react";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const initialMessages: Message[] = [
  {
    user_id: "user-1",
    model_tag: "gpt-4",
    role: "system",
    content: "Welcome to the AI chat. Ask anything or use quick actions below.",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    user_id: "user-1",
    model_tag: "gpt-4",
    role: "user",
    content: "Give me a short summary of project status.",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    user_id: "assistant-1",
    model_tag: "gpt-4",
    role: "assistant",
    content: "Project is on track. Key outstanding items: deploy, QA fixes, and stakeholder review.",
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

export default function ChatForm() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [model, setModel] = React.useState<string>("gpt-4");

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

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

  // keep form model_tag in sync with model state
  React.useEffect(() => {
    reset({ content: "", model_tag: model });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // scroll to bottom whenever messages change
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

    setTimeout(() => {
      const reply: Message = {
        user_id: "assistant-1",
        model_tag: newMsg.model_tag,
        role: "assistant",
        content: `Assistant (${newMsg.model_tag}) reply to: ${newMsg.content}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-6">
        <div className="bg-background flex flex-1 flex-col rounded-lg border">
          {/* messages area (flex-1 so input stays at bottom using flex layout) */}
          <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const bubbleBg = isUser
                ? "bg-sky-50 text-sky-900 dark:bg-sky-900/20 dark:text-sky-100"
                : m.role === "assistant"
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/10 dark:text-emerald-100"
                  : "bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-gray-100";
              const containerClasses = isUser ? "flex w-full justify-end px-2" : "flex w-full justify-start px-2";
              const radiusClass = isUser
                ? "rounded-tl-lg rounded-bl-lg rounded-tr-lg"
                : "rounded-tr-lg rounded-br-lg rounded-tl-lg";

              return (
                <div key={`${m.user_id}-${i}-${m.created_at}`} className={containerClasses}>
                  <div className={`max-w-[72%] ${bubbleBg} ${radiusClass} p-3`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium">
                        {m.role === "user" ? "You" : m.role === "assistant" ? "Assistant" : "System"}
                        <span className="text-muted-foreground ml-2 text-xs">· {m.model_tag}</span>
                      </div>
                      <div className="text-muted-foreground text-xs">{new Date(m.created_at).toLocaleTimeString()}</div>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* input group placed in the same flex column (no fixed positioning) */}
          <div className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <InputGroup className="flex items-end gap-2">
                <InputGroupTextarea
                  placeholder="Ask, Search or Chat..."
                  {...register("content")}
                  aria-invalid={!!errors.content}
                  className="max-h-36 min-h-[44px] flex-1"
                />
                <InputGroupAddon align="block-end" className="flex items-center gap-2">
                  <InputGroupButton variant="outline" className="rounded-full" size="icon-xs" type="button">
                    <IconPlus />
                  </InputGroupButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" type="button">
                        {model}
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="[--radius:0.95rem]">
                      <DropdownMenuItem onClick={() => setModel("gpt-4-x")}>gpt-4-x</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setModel("gpt-4")}>gpt-4</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setModel("gpt-3.5")}>gpt-3.5</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <InputGroupText className="ml-auto">Model</InputGroupText>
                  <Separator orientation="vertical" className="!h-6" />
                  <InputGroupButton
                    variant="default"
                    className="rounded-full"
                    size="icon-xs"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {errors.content && <div className="text-destructive mt-2 text-sm">{errors.content.message}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
