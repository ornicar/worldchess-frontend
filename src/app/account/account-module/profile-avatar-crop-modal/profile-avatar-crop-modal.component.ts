import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';


@Component({
  selector: 'profile-avatar-crop-modal',
  templateUrl: './profile-avatar-crop-modal.component.html',
  styleUrls: ['./profile-avatar-crop-modal.component.scss']
})
export class ProfileAvatarCropModalComponent {
  showCropper = false;
  croppedImage = null;
  imageChangedEvent = '';

  constructor(private dialogRef: MatDialogRef<ProfileAvatarCropModalComponent>) {}

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  @ViewChild('upload') uploadInput: ElementRef;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  
  imageLoaded() {
    this.showCropper = true;
  }
  
  cropperReady() {
  }
  
  loadImageFailed () {
  }
  
  rotateLeft() {
    this.imageCropper.rotateLeft();
  }
  
  rotateRight() {
    this.imageCropper.rotateRight();
  }
  
  flipHorizontal() {
    this.imageCropper.flipHorizontal();
  }
  
  flipVertical() {
    this.imageCropper.flipVertical();
  }

  openFileDialog() {
    if (this.uploadInput) {
      this.uploadInput.nativeElement.click();
    }
  }

  close() {
    this.dialogRef.close();
  }

  done() {
    this.dialogRef.close(this.croppedImage);
  }
}
