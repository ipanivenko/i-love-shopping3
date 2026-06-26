import { Injectable } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow('CLOUDINARY_API_SECRET'),
    })
  }

  async uploadProductImage(file: Express.Multer.File, folder = 'products') {
    return new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) return reject(error)

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          })
        },
      )

      uploadStream.end(file.buffer)
    })
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId)
  }

  getThumbnailUrl(publicId: string) {
    return cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    })
  }

  getMediumUrl(publicId: string) {
    return cloudinary.url(publicId, {
      width: 800,
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    })
  }

  getFullSizeUrl(publicId: string) {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    })
  }

  getResponsiveUrls(publicId: string) {
    return {
      thumbnailUrl: this.getThumbnailUrl(publicId),
      mediumUrl: this.getMediumUrl(publicId),
      fullSizeUrl: this.getFullSizeUrl(publicId),
    }
  }
}