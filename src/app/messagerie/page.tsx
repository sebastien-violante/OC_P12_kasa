"use client";

import styles from "./page.module.css";
import ConversationTile from "../components/ConversationTile/ConversationTile";
import { useEffect, useState } from "react";
import getRequest from "../utils/getRequest";
import type { Conversation, Message, FlashMessageType } from "../types/types";
import Cookies from "js-cookie";
import Loader from "../components/Loader/Loader";
import MessageTile from "../components/MessageTile/MessageTile";
import { Fragment } from "react";
import postRequest from "../utils/postRequest";
import patchRequest from "../utils/patchRequest";
import FlashMessage from "../components/FlashMessage/FlashMessage";
import { useMessageStore } from "../store/messageStore";
import { apiUrl } from "../utils/api";
import Link from "next/link";

export default function Messagerie() {
  const token = Cookies.get("token");
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

  // Envoi d'un message
  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Empêche l'envoi d'un message sans sélection d'une conversation
    if (selectedConversationId === null) {
      setFlash({
        status: false,
        message:
          "Vous devez sélectionner une conversation pour pouvoir envoyer un message",
      });
      return;
    }

    // Empêche l'envoi d'un message vide
    if (!message.trim()) {
      setFlash({
        status: false,
        message: "Vous devez saisir un message avant d'envoyer",
      });
      return;
    }

    // Envoi du message
    try {
      const messageResponse = await postRequest<{ content: string }, Message>({
        url: apiUrl(`/api/conversations/${selectedConversationId}/messages`),
        token,
        payload: {
          content: message.trim(),
        },
      });
      // Ajout dans le store
      if (messageResponse.data) {
        addMessage(messageResponse.data);
      }

      // Vidage du champ message et affichage du Flash
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
    }
  }

  const isSameDay = (date1: string, date2: string): boolean => {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  };

  // Chargement de toutes les conversations de l'utilisateur
  useEffect(() => {
    const loadConversations = async () => {
      const data = await getRequest<Conversation[]>({
        url: apiUrl("/api/conversations"),
        token,
      });
      setConversations(data);
    };
    loadConversations();
  }, []);

  // Récupération de l'id de la conversation en cas de provenance de la carte du logement
  useEffect(() => {
    const conversationId = new URLSearchParams(window.location.search).get(
      "conversationId",
    );
    if (conversationId) {
      setSelectedConversationId(Number(conversationId));
      setIsMessagesDisplayed(true);
    }
  }, [setSelectedConversationId]);
  // Chargement des messages correspondant à la conversation sélectionnée
  useEffect(() => {
    if (selectedConversationId === null) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        // Récupération des messages depuis le store
        await loadMessages(selectedConversationId, token);
        // Lors de l'affichage des messages, tous les messages sont considérés lus
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
          <Link href="/" className={styles.link}>
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
            <img src="/pictures/send-message.svg" alt="" />
          </button>
        </form>
      </section>
    </div>
  );
}
