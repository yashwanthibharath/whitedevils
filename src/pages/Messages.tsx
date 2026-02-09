import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Contact {
  user_id: string;
  full_name: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Get all unique contacts from messages
    const fetchContacts = async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      
      const contactIds = new Set<string>();
      (msgs ?? []).forEach((m) => {
        if (m.sender_id !== user.id) contactIds.add(m.sender_id);
        if (m.receiver_id !== user.id) contactIds.add(m.receiver_id);
      });
      
      if (contactIds.size > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", [...contactIds]);
        setContacts(profiles ?? []);
      }
    };
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedContact) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      // Mark as read
      await supabase.from("messages").update({ read: true }).eq("sender_id", selectedContact).eq("receiver_id", user.id).eq("read", false);
    };
    fetchMessages();

    const channel = supabase
      .channel(`messages-${selectedContact}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedContact) || (msg.sender_id === selectedContact && msg.receiver_id === user.id)) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedContact]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMsg.trim()) return;
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: selectedContact, content: newMsg.trim() });
    setNewMsg("");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <Card className="w-64 shrink-0 overflow-y-auto">
          <CardContent className="p-2 space-y-1">
            {contacts.length === 0 && <p className="text-sm text-muted-foreground p-3">No conversations yet.</p>}
            {contacts.map((c) => (
              <button
                key={c.user_id}
                onClick={() => setSelectedContact(c.user_id)}
                className={cn("w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors", selectedContact === c.user_id ? "bg-accent text-accent-foreground" : "hover:bg-muted")}
              >
                {c.full_name}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-xs rounded-xl px-4 py-2 text-sm", msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t p-3 flex gap-2">
                <Input placeholder="Type a message…" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
