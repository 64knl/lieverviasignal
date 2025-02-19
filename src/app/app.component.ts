import {
  AfterViewInit,
  Component,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'lieverviasignal';

  cx: CanvasRenderingContext2D | undefined;
  canvasEl!: HTMLCanvasElement;

  readyToDownload = signal<boolean>(false);

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.cx = this.canvasEl.getContext('2d')!;
    this.canvasEl.width = 1200;
    this.canvasEl.height = 1200;
    this.redraw();
  }
  redraw(imageData?: any) {
    const image = new Image();
    const mask = new Image();
    image.onload = () => {
      this.cx!.drawImage(image, 300, 130, 600, 600);
      mask.onload = () => {
        this.cx!.drawImage(mask, 0, 0, 1200, 1200);
      };
      mask.src = '/liever-via-signal-mask.png';
    };
    if (!imageData) {
      image.src = '/person.jpg';
    } else {
      image.src = imageData as string;
      this.readyToDownload.set(true);
    }
  }
  selectFile(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }

    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onloadend = (_event: ProgressEvent<FileReader>) => {
      this.cropImage(reader.result! as string).then((croppedImage) => {
        this.redraw(croppedImage);
      });
    };
  }

  download() {
    return this.canvas.nativeElement.toDataURL();
  }

  cropImage(inputDataURI: string) {
    const width = 600;
    const that: CallableFunction = this.getWidthHeight;
    return new Promise((resolve, reject) => {
      if (inputDataURI.slice(0, 10) !== 'data:image') {
        reject(new Error('Not an image.'));
      }
      const c = document.createElement('canvas');
      c.height = width;
      c.width = width;
      const ctx = c.getContext('2d');
      const i = document.createElement('img');
      i.addEventListener('load', function () {
        const [x, y, w, h] = that(i, width);
        ctx!.drawImage(i, x, y, w, h);
        resolve(c.toDataURL('image/png'));
      });
      i.src = inputDataURI;
    });
  }

  getWidthHeight(img: HTMLImageElement, side: number) {
    const { width, height } = img;
    if (width === height) {
      return [0, 0, side, side];
    } else if (width < height) {
      const rat = height / width;
      const top = (side * rat - side) / 2;
      return [0, -1 * top, side, side * rat];
    } else {
      const rat = width / height;
      const left = (side * rat - side) / 2;
      return [-1 * left, 0, side * rat, side];
    }
  }
}
