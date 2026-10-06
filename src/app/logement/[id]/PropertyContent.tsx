"use client";

import styles from "./page.module.css";
import type {
  Property,
  Message,
  CreateConversationPayload,
  CreatedConversation,
  FlashMessageType,
  PreviousConversationResponse,
} from "@/app/types/types";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/app/components/Tag/Tag";
import formatUrl from "@/app/utils/formatUrl";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import postRequest from "@/app/utils/postRequest";
import getRequest from "@/app/utils/getRequest";
import Cookies from "js-cookie";
import FlashMessage from "@/app/components/FlashMessage/FlashMessage";
import { apiUrl } from "@/app/utils/api";
import FocusTrap from "focus-trap-react";

type PropertyContentProps = {
  property: Property;
};

/**
 * Affiche le contenu détaillé d'un logement.
 *
 * Présente les informations du logement, ses équipements, ses catégories
 * et les informations de l'hôte. Permet également à un utilisateur connecté
 * de contacter l'hôte ou de poursuivre une conversation existante.
 */
export default function PropertyContent({
  property,
}: PropertyContentProps) {
  const { user } = useAuth();
  console.log("USER", user)
  console.log("PROPERTY", property)
  const token = Cookies.get("token");

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [apiError, setApiError] = useState("");
  const [flash, setFlash] = useState<FlashMessageType | null>(null);
  const [previousConversationExists, setPreviousConversationExists] =
    useState(false);
  const [previousConversationId, setPreviousConversationId] = useState<
    number | null
  >(null);

  /**
   * Référence vers le bouton qui ouvre la modale.
   *
   * Elle permet de replacer le focus sur ce bouton lorsque la modale
   * est fermée.
   */
  const contactButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Référence vers le titre de la modale.
   *
   * Le focus initial du FocusTrap est placé sur ce titre.
   */
  const modalTitleRef = useRef<HTMLHeadingElement>(null);

  /**
   * Permet de savoir si la modale a réellement été ouverte avant
   * de replacer le focus sur le bouton déclencheur.
   */
  const wasModalOpen = useRef(false);

  /**
   * Ferme la modale.
   *
   * Le FocusTrap ne gère volontairement pas la fermeture de la modale.
   * Il gère uniquement le déplacement du focus.
   */
  function closeMessageModal() {
    setIsMessageModalOpen(false);
    setApiError("");
  }

  /**
   * Replace le focus sur le bouton "Contacter l'hôte" uniquement
   * lorsque la modale vient réellement d'être fermée.
   */
  useEffect(() => {
    if (isMessageModalOpen) {
      wasModalOpen.current = true;
      return;
    }

    if (wasModalOpen.current) {
      contactButtonRef.current?.focus();
      wasModalOpen.current = false;
    }
  }, [isMessageModalOpen]);

  /**
   * Envoie un message à l'hôte.
   *
   * Crée une conversation pour le logement si nécessaire, puis ajoute
   * le message à cette conversation avant de fermer la modale.
   */
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setApiError("Vous devez être connecté.e pour envoyer un message");
      return;
    }

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
        closeMessageModal();

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
  }

  /**
   * Vérifie si l'utilisateur possède déjà une conversation avec l'hôte
   * pour ce logement afin d'adapter l'action proposée dans l'interface.
   */
  useEffect(() => {
    async function getIfAlreadyConversation() {
      if (!token) return;

      try {
        const result = await getRequest<PreviousConversationResponse>({
          url: apiUrl(`/api/properties/${property.id}/conversation`),
          token,
        });

        if (result) {
          setPreviousConversationExists(result.exists);
          setPreviousConversationId(result.conversationId);
        }
      } catch (error) {
        console.error(error);
      }
    }

    getIfAlreadyConversation();
  }, [property.id, token]);

  return (
    <>
      {flash && (
        <FlashMessage status={flash.status} message={flash.message} />
      )}

      <section className={styles.top}>
        <Link href="/">
          <div className={styles.backToProperties}>
            <img src="/pictures/back-arrow.svg" alt="" />
            <span className="block lg:hidden">Retour aux annonces</span>
            <span className="hidden lg:block">Retour</span>
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

                    <span className={styles.tag}>{equipment}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.category}>
              <h2>Catégorie</h2>

              <div className={styles.tags}>
                {property.tags?.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className={styles.host}>
          <h2>Votre hôte</h2>

          <div className={styles.data}>
            <div
              itemProp="host"
              itemScope
              itemType="https://schema.org/Person"
            >
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
              {!previousConversationExists && (
                <button
                  ref={contactButtonRef}
                  type="button"
                  onClick={() => {
                    setApiError("");
                    setIsMessageModalOpen(true);
                  }}
                  className={styles.link}
                >
                  Contacter l&apos;hôte
                </button>
              )}

              {previousConversationExists && (
                <Link
                  href={`/messagerie?conversationId=${previousConversationId}&returnTo=${encodeURIComponent(
                    `/logement/${property.id}`,
                  )}`}
                  className={styles.link}
                >
                  Envoyer un message
                </Link>
              )}
            </>
          )}
        </section>
      </div>

      {isMessageModalOpen && (
        <FocusTrap
          focusTrapOptions={{
            /**
             * Le focus est placé sur le titre de la modale.
             *
             * On utilise une fonction plutôt qu'un sélecteur CSS afin
             * d'éviter les problèmes lorsque plusieurs composants
             * similaires sont présents sur la page.
             */
            initialFocus: () => {
              return modalTitleRef.current as HTMLElement;
            },

            /**
             * Escape est géré manuellement dans la modale.
             *
             * Cela évite que FocusTrap tente lui-même de désactiver
             * le trap et de modifier le cycle de rendu React.
             */
            escapeDeactivates: false,

            /**
             * Le focus retourne automatiquement à l'élément qui
             * avait le focus avant l'activation du FocusTrap.
             */
            returnFocusOnDeactivate: true,
          }}
        >
          <div
            className={styles.modalOverlay}
            onMouseDown={(e) => {
              /**
               * Ferme uniquement lorsque l'utilisateur clique
               * directement sur l'overlay.
               */
              if (e.target === e.currentTarget) {
                closeMessageModal();
              }
            }}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="message-modal-title"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  closeMessageModal();
                }
              }}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeMessageModal}
                aria-label="Fermer"
              >
                ×
              </button>

              <h2
                id="message-modal-title"
                ref={modalTitleRef}
                tabIndex={-1}
              >
                Message pour {property.host.name} :
              </h2>

              {apiError && (
                <p
                  id="api-error"
                  role="alert"
                  className={styles.apiError}
                >
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
                  aria-describedby={apiError ? "api-error" : undefined}
                />

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className="rounded-lg bg-red-800 px-6 py-2 text-white shadow-lg"
                    onClick={closeMessageModal}
                    disabled={sendingMessage}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-700 px-6 py-2 text-white shadow-lg"
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </FocusTrap>
      )}
    </>
  );
}
