/** Use Case: UploadImageUseCase (optional) */
class UploadImageUseCase {
  /** @param {{imageRepo: import('../ports/ImageRepository')}} deps */
  constructor({ imageRepo }) { this.imageRepo = imageRepo; }
  /** @param {{file: Buffer|any, tags: string[]}} input */
  async execute(input) { return this.imageRepo.upload(input.file, input.tags); }
}
module.exports = UploadImageUseCase;
