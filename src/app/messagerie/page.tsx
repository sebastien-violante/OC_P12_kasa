"use client";

import styles from "./page.module.css";
import ConversationTile from "../components/ConversationTile/ConversationTile";
import { useEffect, useState } from "react";
import getRequest from "../utils/getRequest";
import type { Conversation, Message } from "../types/types";
import Cookies from "js-cookie";
import Loader from "../components/Loader/Loader";
import MessageTile from "../components/MessageTile/MessageTile";
import { formatDate } from "../utils/formatDate";
import { Fragment } from "react";
import postRequest from "../utils/postRequest";

export default function Messagerie() {
  const token = Cookies.get("token");
  const [conversations, setConversations] = useState<Conversation[] | []>([]);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const initFomData = {
    message: "",
  };
  const [formData, setFormData] = useState(initFomData);

  async function handleSendMessage() {
    try {
      if (message === "") {
        throw new Error(
          "Vous devez saisir un texte avant d'nevoyer votre message",
        );
      }
      if (!selectedConversationId)
        throw new Error(
          "Vous devez sélectionner une conversation avant d'envoyer un message",
        );
      const messageResponse = await postRequest<{ content: string }, Message>({
        url: `/api/conversations/${selectedConversationId}/messages`,
        token,
        payload: {
          content: message,
        },
      });
    } catch (error) {
      console.error(error);
    }

    /* 
    const messageResponse = await postRequest<{ content: string }, Message>({
            url: `/api/conversations/${selectedConversationId}/messages`,
            token,
            payload: {
              content: message,
            },
          });
    
          console.log("message reponse", messageResponse);
*/
  }

  const isSameDay = (date1: string, date2: string): boolean => {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  };

  useEffect(() => {
    const loadConversations = async () => {
      const data = await getRequest<Conversation[]>({
        url: "/api/conversations",
        token,
      });
      console.log("CONVERSATIONS", data);
      setConversations(data);
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      setLoading(true);
      const loadMessages = async () => {
        try {
          const messages = await getRequest<Message[]>({
            url: `/api/conversations/${selectedConversationId}/messages`,
            token,
          });

          setMessages(messages);
          console.log("MESSAGES", messages);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadMessages();
    }
  }, [selectedConversationId]);

  return (
    <div className={styles.mainWrapper}>
      <section className={styles.messages}>
        <div className={styles.back}>
          <button>Retour</button>
        </div>

        <h1>Messages</h1>
        <div className={styles.messageList}>
          {conversations.map((conversation) => (
            <ConversationTile
              key={conversation.id}
              id={conversation.id}
              user={conversation.otherUser.name}
              message={conversation.lastMessage?.content}
              date={conversation.lastMessage?.createdAt}
              setSelectedConversationId={setSelectedConversationId}
              unreadCount={conversation.unreadCount}
            />
          ))}
        </div>
      </section>
      <section className={styles.details}>
        <div className={styles.backToList}>
          <button>Retour à la liste</button>
        </div>
        <div className={styles.details}>
          {loading && (
            <div
              role="status"
              aria-live="polite"
              aria-label="chargement des logements"
            >
              <Loader />
              <span className="sr-only">Chargement des messages</span>
            </div>
          )}
          {messages?.map((message, index) => {
            const previousMessage = messages[index - 1];

            const showDate =
              !previousMessage ||
              !isSameDay(message.createdAt, previousMessage.createdAt);

            return (
              <Fragment key={message.id}>
                {showDate && (
                  <div className={styles.messageDate}>
                    <span>
                      {new Date(message.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <MessageTile message={message} />
              </Fragment>
            );
          })}
        </div>
        <form className={styles.messageForm} onSubmit={handleSendMessage}>
          <textarea
            className={styles.messageInput}
            placeholder="Envoyer un message..."
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="submit"
            className={styles.sendButton}
            aria-label="Envoyer le message"
          >
            <img src="/pictures/send-message.svg" alt="" />
          </button>
        </form>
      </section>
    </div>
  );
}
