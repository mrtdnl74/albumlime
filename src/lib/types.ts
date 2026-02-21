export type Section = {
    id: string;
    name: string;
    sort_order: number;
};

export type Photo = {
    id: string;
    drive_file_id: string;
    section_id: string | null;
    filename: string;
    mime_type: string;
    thumb_url: string | null;
    web_url: string | null;
    created_at: string;
};
