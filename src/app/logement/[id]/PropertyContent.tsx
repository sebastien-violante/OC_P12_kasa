"use client";

import styles from "./page.module.css";
import type {
  Property,
  Message,
  CreateConversationPayload,
  CreatedConversation,
  FlashMessageType,
} from "@/app/types/types";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/app/components/Tag/Tag";
import formatUrl from "@/app/utils/formatUrl";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import postRequest from "@/app/utils/postRequest";
import Cookies from "js-cookie";
import FlashMessage from "@/app/components/FlashMessage/FlashMessage";
import { apiUrl } from "@/app/utils/api";

type PropertyContentProps = {
  property: Property;
};

export default function PropertyContent({ property }: PropertyContentProps) {
  const { user } = useAuth();
  const token = Cookies.get("token");

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [apiError, setApiError] = useState("");
  const [flash, setFlash] = useState<FlashMessageType | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message) {
      setApiError("Vous devez saisir un message avant d'envoyer");
      return;
    }

    setSendingMessage(true);
    setApiError("");
    if (property.id) {
      try {
        const conversationResponse = await postRequest<
          CreateConversationPayload,
          CreatedConversation
        >({
          url: apiUrl("/api/conversations"),
          token,
          payload: {
            propertyId: property.id,
          },
        });

        if (!conversationResponse.data) {
          throw new Error("La conversation n'a pas pu être créée.");
        }

        const conversationId = conversationResponse.data.id;

        await postRequest<{ content: string }, Message>({
          url: apiUrl(`/api/conversations/${conversationId}/messages`),
          token,
          payload: { content: message },
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
    }
  };

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
      </section>

      <div className={styles.mainWrapper}>
        <section
          className={styles.property}
          itemScope
          itemType="https://schema.org/Accommodation"
        >
          <div className={styles.grid}>
            <div className={styles.item}>
              {property.cover && (
                <Image
                  src={formatUrl(property.cover)}
                  fill
                  alt={`Image de couverture du logement ${property.title}`}
                  className={styles.cover}
                  priority
                  itemProp="image"
                />
              )}
            </div>

            {property.pictures?.map((picture, index) => (
              <div key={index} className={styles.item}>
                <Image
                  src={formatUrl(picture)}
                  fill
                  alt=""
                  className={styles.image}
                  priority
                  itemProp="image"
                />
              </div>
            ))}
          </div>

          <article className={styles.data}>
            <h1 itemProp="name">{property.title}</h1>

            <p className={styles.location}>
              <img src="/pictures/localisation.svg" alt="" />

              <span itemProp="address">{property.location}</span>
            </p>

            <p className={styles.description} itemProp="description">
              {property.description}
            </p>

            <div className={styles.equipments}>
              <h2>Equipements</h2>

              <div className={styles.tags}>
                {property.equipments?.map((equipment) => (
                  <div
                    key={equipment}
                    itemProp="amenityFeature"
                    itemScope
                    itemType="https://schema.org/LocationFeatureSpecification"
                  >
                    <meta itemProp="name" content={equipment} />

                    <meta itemProp="value" content="true" />

                    <Tag item={equipment} select={false} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.category}>
              <h2>Catégorie</h2>

              <div className={styles.tags}>
                {property.tags?.map((tag) => (
                  <Tag key={tag} item={tag} select={true} />
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className={styles.host}>
          <h2>Votre hôte</h2>

          <div className={styles.data}>
            <div itemProp="host" itemScope itemType="https://schema.org/Person">
              {property.host.picture ? (
                <Image
                  src={formatUrl(property.host.picture)}
                  alt={property.host.name}
                  height={82}
                  width={82}
                  itemProp="image"
                />
              ) : (
                <Image
                  src="/pictures/default-pictures/default-profile.jpg"
                  alt={property.host.name}
                  height={82}
                  width={82}
                />
              )}
            </div>

            <p itemProp="name">{property.host.name}</p>

            <div className={styles.rating}>
              <img src="/pictures/star-full.svg" alt="" />
              {property.rating_avg ?? 0}
            </div>
          </div>

          {property.host.id !== user?.id && (
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

            <h2>Message pour {property.host.name} :</h2>

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
                  disabled={sendingMessage}
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
