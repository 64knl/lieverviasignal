import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'lieverviasignal';

  cx: CanvasRenderingContext2D | undefined;
  canvasEl!: HTMLCanvasElement;

readyToDownload = signal<boolean>(false);

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.cx = this.canvasEl.getContext('2d')!;
    this.canvasEl.width = 1200;
    this.canvasEl.height = 1200;
    this.redraw();
  }
  redraw ( imageData?: string| ArrayBuffer) {
    const image = new Image();
    const mask = new Image();
    image.onload = ()=> {
      this.cx!.drawImage(image, 300, 130, 600,600);
      mask.onload = ()=> {
        this.cx!.drawImage(mask,0, 0, 1200,1200 );
      }
        mask.src = "/liever-via-signal-mask.png";

    }
    if ( !imageData) {
    image.src = "/person.jpg";
    } else {
      image.src = imageData as string;
      this.readyToDownload.set(true);

    }
  }
    selectFile(event: any) { //Angular 11, for stricter type
      if(!event.target.files[0] || event.target.files[0].length == 0) {
        return;
      }
      
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      
      reader.onloadend = (_event) => {
        this.redraw( reader.result!);
      }
  }

  download()
  {
    var link = document.createElement('a');
    link.download = 'liever-via-signal.png';
    link.href = this.canvas.nativeElement.toDataURL()
    link.click();
  
  }
}
