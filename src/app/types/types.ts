export type Property = {
    cover : string;
    description: string;
    host: Host;
    id: string;
    location: string;
    price_per_night: number;
    rating_avg: number;
    rating_counts: number;
    slug: string;
    title: string;
    pictures?: string[];
    equipments?: string[];
    tags?: string[];
};

export type Host = {
    id: number;
    name: string;
    picture: string;
}

export type RegistrationFormData = {
    name: string;
    firstname: string;
    email: string;
    password: string;
}

export type LoginFormData = {
    email: string;
    password: string;
}

export type User = {
    id: number;
    name: string;
    email: string;
    picture: string | null;
    role: Role ;
}

export type Role = "owner" | "client" | "admin"

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: ApiErrorDetail[];
};

export type ApiError = {
  status: number;
  message: string;
  error?: string;
  details?: ApiErrorDetail[];
};

export type ApiErrorDetail = {
  field: string;
  message: string;
};

// Types d'envoi et de réponse pour l'enregistrement
export type RegistrationPayload = {
  name: string;
  email: string;
  password: string;
};

export type RegistrationResponse = {
    token: string;
    user: User;
}

// Types d'envoi et de réponse pour l'authentification
export type AuthenticationPayload = {
  email: string;
  password: string;
};

export type AuthenticationResponse = {
    token: string;
    user: User;
}

export type FlashType = {
  type: "success" | "warning" | "fail";
  message: string;
};
