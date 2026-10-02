"use client";

import styles from "./page.module.css";
import ConversationTile from "../components/ConversationTile/ConversationTile";
import { useEffect, useState, Fragment } from "react";
import getRequest from "../utils/getRequest";
import type { Conversation, Message, FlashMessageType } from "../types/types";
import Cookies from "js-cookie";
import Loader from "../components/Loader/Loader";
import MessageTile from "../components/MessageTile/MessageTile";
import postRequest from "../utils/postRequest";
import patchRequest from "../utils/patchRequest";
import FlashMessage from "../components/FlashMessage/FlashMessage";
import { useMessageStore } from "../store/messageStore";
import { apiUrl } from "../utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MessagerieProps = {
  conversationId?: string;
  returnTo?: string;
};

/**
 * Affiche l'interface de messagerie de l'utilisateur.
 *
 * Gère le chargement des conversations, l'affichage des messages de la
 * conversation sélectionnée, l'envoi de nouveaux messages et la mise à jour
 * de leur statut de lecture.
 */
export default function Messagerie({
  conversationId,
  returnTo = "/",
}: MessagerieProps) {
  const token = Cookies.get("token");
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[] | []>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [flash, setFlash] = useState<FlashMessageType | null>(null);
  const [isMessagesDisplayed, setIsMessagesDisplayed] = useState(false);

  const {
    messages,
    selectedConversationId,
    setSelectedConversationId,
    setMessages,
    addMessage,
  } = useMessageStore();

  const loadMessages = useMessageStore((state) => state.loadMessages);
  const [isSending, setIsSending] = useState(false);
  /**
   * Envoie le message dans la conversation sélectionnée.
   */
  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedConversationId === null) {
      setFlash({
        status: false,
        message:
          "Vous devez sélectionner une conversation pour pouvoir envoyer un message",
      });
      return;
    }

    if (!message.trim()) {
      setFlash({
        status: false,
        message: "Vous devez saisir un message avant d'envoyer",
      });
      return;
    }

    setIsSending(true);

    try {
      const messageResponse = await postRequest<{ content: string }, Message>({
        url: apiUrl(`/api/conversations/${selectedConversationId}/messages`),
        token,
        payload: {
          content: message.trim(),
        },
      });

      if (messageResponse.data) {
        addMessage(messageResponse.data);
      }

      setMessage("");
      setFlash({
        status: true,
        message: "Votre message a bien été envoyé",
      });
    } catch (error) {
      console.error(error);

      setFlash({
        status: false,
        message: "Une erreur est survenue lors de l'envoi du message",
      });
    } finally {
      setIsSending(false);
    }
  }

  /**
   * Vérifie si deux messages ont été envoyés le même jour (pour la gestion des séparateurs dans l'affichage)
   */
  function isSameDay(date1: string, date2: string): boolean {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }

  /**
   * Charge toutes les conversations de l'utilisateur connecté.
   */
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);

      if (!token) {
        router.push("/connexion");
        return;
      }

      try {
        const data = await getRequest<Conversation[]>({
          url: apiUrl("/api/conversations"),
          token,
        });

        setConversations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [token]);

  /**
   * Sélectionne automatiquement la conversation transmise dans l'URL lorsque l'utilisateur arrive de la page détail logement.
   */
  useEffect(() => {
    const urlConversationId = new URLSearchParams(window.location.search).get(
      "conversationId",
    );

    if (urlConversationId) {
      setSelectedConversationId(Number(urlConversationId));
      setIsMessagesDisplayed(true);
    }
  }, [setSelectedConversationId]);

  /**
   * Charge les messages de la conversation sélectionnée et les marque comme lus auprès de l'API.
   */
  useEffect(() => {
    if (selectedConversationId === null) {
      return;
    }

    const load = async () => {
      setLoading(true);

      try {
        await loadMessages(selectedConversationId, token);

        await patchRequest({
          url: apiUrl(`/api/conversations/${selectedConversationId}/read`),
          token,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedConversationId, setMessages, token]);

  return (
    <div className={styles.mainWrapper}>
      {flash && <FlashMessage status={flash.status} message={flash.message} />}

      <section
        className={`${styles.conversations} ${
          isMessagesDisplayed ? styles.conversationsHidden : ""
        }`}
      >
        <div className={styles.back}>
          <Link href={returnTo} className={styles.link}>
            <img alt="" src="/pictures/back-arrow.svg" />
            Retour
          </Link>
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
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
              setIsMessagesDisplayed={setIsMessagesDisplayed}
              unreadCount={conversation.unreadCount}
            />
          ))}
        </div>
      </section>

      <section
        className={`${styles.messages} ${
          isMessagesDisplayed ? styles.messagesDisplayed : ""
        }`}
      >
        <div className={styles.backToList}>
          <button type="button" onClick={() => setIsMessagesDisplayed(false)}>
            <img alt="" src="/pictures/back-arrow.svg" />
            Retour
          </button>
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
          <label htmlFor="message" className="sr-only">
            Envoyer un message
          </label>

          <textarea
            id="message"
            name="message"
            className={styles.messageInput}
            placeholder="Envoyer un message..."
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />

          <button
            type="submit"
            className={styles.sendButton}
            aria-label="Envoyer le message"
          >
            {isSending ? (
              <span className={styles.spans}>
                <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full "></span>
              </span>
            ) 
            : 
            <img src="/pictures/send-message.svg" alt="" />
          }
          </button>
        </form>
      </section>
    </div>
  );
}
