"use client";

import styles from "./page.module.css";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  Property,
  SendMessagePayload,
  Message,
  CreateConversationPayload,
  CreatedConversation,
  FlashMessageType,
} from "@/app/types/types";
import getRequest from "@/app/utils/getRequest";
import Loader from "@/app/components/Loader/Loader";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/app/components/Tag/Tag";
import formatUrl from "@/app/utils/formatUrl";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import postRequest from "@/app/utils/postRequest";
import Cookies from "js-cookie";
import FlashMessage from "@/app/components/FlashMessage/FlashMessage";

export default function Property() {
  const params = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(true);
  const propertyId = params.id;
  const [property, setProperty] = useState<Property | null>(null);
  const token = Cookies.get("token");
  const [flash, setFlash] = useState<FlashMessageType | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) {
      return;
    }
    if (!message) {
      setApiError("Vous devez saisir un message avant d'envoyer");
      return;
    }
    setSendingMessage(true);
    setApiError("");
    try {
      // Création de l'id de la conversation
      const conversationResponse = await postRequest<
        CreateConversationPayload,
        CreatedConversation
      >({
        url: "/api/conversations",
        token,
        payload: { propertyId },
      });
      if (!conversationResponse.data) {
        throw new Error("La conversation n'a pas pu être créée.");
      }
      const conversationId = conversationResponse.data.id;

      // envoi du message correspondant au numéro d'id de la conversation
      const messageResponse = await postRequest<{ content: string }, Message>({
        url: `/api/conversations/${conversationId}/messages`,
        token,
        payload: {
          content: message,
        },
      });
      setMessage("");
      setIsMessageModalOpen(false);
      setFlash({
        status: true,
        message: "Votre message a bien été envoyé",
      });
    } catch (error) {
      console.error(error);
      setApiError("Impossible d'envoyer le message. Réessayez plus tard.");
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const property = await getRequest<Property>({
          url: `/api/properties/${propertyId}`,
        });
        setProperty(property);

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    loadProperty();
  }, []);

  return (
    <>
      {flash && <FlashMessage status={flash.status} message={flash.message} />}
      <section className={styles.top}>
        <Link href="/">
          <div className={styles.backToProperties}>
            <img src="/pictures/back-arrow.svg" alt="" />
            <span>Retour aux annonces</span>
          </div>
        </Link>
        {loading && (
          <div role="status" aria-live="polite">
            <Loader />
            <span className="sr-only">Chargement des logements…</span>
          </div>
        )}
      </section>

      <div className={styles.mainWrapper}>
        <section className={styles.property}>
          <div className={styles.grid}>
            <div className={styles.item}>
              {property?.cover && (
                <Image
                  src={formatUrl(property?.cover)}
                  fill
                  alt={`image de couverture de la propriété ${property?.title}`}
                  className={styles.cover}
                  priority
                />
              )}
            </div>
            {property?.pictures?.map((picture, index) => (
              <div key={index} className={styles.item}>
                <Image
                  src={formatUrl(picture)}
                  fill
                  alt=""
                  className={styles.image}
                  priority
                />
              </div>
            ))}
          </div>
          <article className={styles.data}>
            <h1>{property?.title}</h1>
            <p className={styles.location}>
              <img src="/pictures/localisation.svg" alt="" />
              {property?.location}
            </p>
            <p className={styles.description}>{property?.description}</p>
            <div className={styles.equipments}>
              <h2>Equipements</h2>
              <div className={styles.tags}>
                {property?.equipments?.map((equipment) => (
                  <Tag key={equipment} item={equipment} select={false} />
                ))}
              </div>
            </div>
            <div className={styles.category}>
              <h2>Catégorie</h2>
              <div className={styles.tags}>
                {property?.tags?.map((tag) => (
                  <Tag key={tag} item={tag} select={true} />
                ))}
              </div>
            </div>
          </article>
        </section>
        <section className={styles.host}>
          <h2>Votre hôte</h2>
          <div className={styles.data}>
            <div>
              {property?.host.picture ? (
                <Image
                  src={formatUrl(property?.host.picture)}
                  alt={property?.host.name ?? ""}
                  height="82"
                  width="82"
                />
              ) : (
                <Image
                  src="/pictures/default-pictures/default-profile.jpg"
                  alt={property?.host.name ?? ""}
                  height="82"
                  width="82"
                />
              )}
            </div>
            <p>{property?.host.name}</p>
            <div className={styles.rating}>
              <img src="/pictures/star-full.svg" alt="" />
              {property?.rating_avg ?? 0}
            </div>
          </div>
          {property?.host.id !== user?.id && (
            <>
              <Link href="#" className={styles.link}>
                Contacter l&apos;hôte
              </Link>
              <button
                type="button"
                onClick={() => setIsMessageModalOpen(true)}
                className={styles.link}
              >
                Envoyer un message
              </button>
            </>
          )}
        </section>
      </div>
      {isMessageModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setIsMessageModalOpen(false);
            setApiError("");
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsMessageModalOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>

            <h2>Message pour {property?.host.name} :</h2>
            {apiError && (
              <p id="api-error" role="alert" className={styles.apiError}>
                {apiError}
              </p>
            )}

            <form onSubmit={handleSendMessage} noValidate>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                rows={6}
                disabled={sendingMessage}
                required
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-6 py-2 text-white shadow-lg"
                  onClick={() => {
                    setIsMessageModalOpen(false);
                    setApiError("");
                  }}
                  disabled={sendingMessage}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-white shadow-lg"
                >
                  {sendingMessage ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
