export type ApiAuthResponse = {
    username: string; // The authenticated user’s username.
    token_type: string; // API token type.
    surname: string; // The authenticated user’s surname.
    last_logged_in_at: string; // The authenticated user’s last known login time.
    id: string; // The authenticated user’s object ID.
    firstname: string; // The authenticated user’s firstname.
    email: string; // The authenticated user’s email address.
    display_name: string; // The authenticated user’s display name.
    access_token: string; // Bearer API token which can be used for authenticated API calls.
};

export type ApiListResponse<T> = {
    objects: T[];
};
