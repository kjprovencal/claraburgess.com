export class CreatePhotoDto {
  url?: string;
  alt: string;
  caption: string;
  date: string;
  category: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export class UpdatePhotoDto {
  url?: string;
  alt?: string;
  caption?: string;
  date?: string;
  category?: string;
  publicId?: string;
  width?: number;
  height?: number;
}
