import {
  UploaderProps,
  UploaderProvider,
} from '@/common/domain/providers/uploader.provider'

export class FakerUploader implements UploaderProvider {
  private uploads: UploaderProps[] = []

  async upload({ filename, filetype, body }: UploaderProps): Promise<string> {
    this.uploads.push({
      filename,
      filetype,
      body,
    })
    return filename
  }
}
