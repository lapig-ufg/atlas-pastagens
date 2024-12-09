import {Component, OnInit, ViewChild} from '@angular/core';
import { PrimeNGConfig } from "primeng/api";
import { Galleria } from "primeng/galleria";
import { GalleriaService } from "./galleria.service";
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";

@Component({
  selector: 'app-galleria',
  templateUrl: './galleria.component.html',
  styleUrls: ['./galleria.component.scss']
})
export class GalleriaComponent implements OnInit {
  public tagsGroup: TagsGroup[] = [];
  public selectedTags: Tag[] = [{tag: "Pastagem", column: 'tag_1'}];

  public images: any[] = [];

  public showThumbnails: boolean;

  public fullscreen: boolean = false;

  public activeIndex: number = 0;

  public onFullScreenListener: any;

  public displayBasic: boolean;
  public displayCustom: boolean = false;

  public defaultTags: Tag[] = [{tag: "Pastagem", column: 'tag_1'}];

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  loading: boolean = false;

  @ViewChild('gallery') galleria!: Galleria;

  constructor(
    private primengConfig: PrimeNGConfig,
    private galleriaService: GalleriaService,
    private localizationService: LocalizationService,
  ) {
    this.displayBasic = true;
    this.showThumbnails = true;
  }

  public ngOnInit() {
    this.primengConfig.ripple = true;
    this.bindDocumentListeners();
    this.getTags();
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.tagsGroup = this.tagsGroup.map(group => {
        group['label'] = this.localizationService.translate('hotsite.gallery.tags.' + group.value)
        return group;
      })
    });
    this.getImages();
  }

  public getTags(){
    this.galleriaService.getTags().subscribe((result: any) => {
      this.tagsGroup = result.map((group: any) => {
        group['label'] = this.localizationService.translate('hotsite.gallery.tags.' + group.value)
        return group;
      })
    })
  }

  public getImages(){
    this.loading = true;
    this.galleriaService.getImages(this.defaultTags).subscribe((result: any) => {
      this.images = result;
      this.loading = false;
    })
  }

  public searchImages(tags: any){
    this.loading = true;
    const itens = tags.length > 0 ? tags : this.defaultTags;
    this.galleriaService.getImages(itens).subscribe((result: any) => {
      this.images = result;
      this.activeIndex = 0;
      this.loading = false;
    })
  }

  public onThumbnailButtonClick() {
    this.showThumbnails = !this.showThumbnails;
  }

  public toggleFullScreen() {
    if (this.fullscreen) {
      this.closePreviewFullScreen();
    }
    else {
      this.openPreviewFullScreen();
    }
  }

  public openPreviewFullScreen() {
    let elem = this.galleria.element.nativeElement.querySelector(".p-galleria");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    else if (elem['mozRequestFullScreen']) { /* Firefox */
      elem['mozRequestFullScreen']();
    }
    else if (elem['webkitRequestFullscreen']) { /* Chrome, Safari & Opera */
      elem['webkitRequestFullscreen']();
    }
    else if (elem['msRequestFullscreen']) { /* IE/Edge */
      elem['msRequestFullscreen']();
    }
  }

  public onFullScreenChange() {
    this.fullscreen = !this.fullscreen;
  }

  public closePreviewFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    else if (document['exitFullscreen']) {
      document.exitFullscreen();;
    }
  }

  public bindDocumentListeners() {
    this.onFullScreenListener = this.onFullScreenChange.bind(this);
    document.addEventListener("fullscreenchange", this.onFullScreenListener);
    document.addEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.addEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.addEventListener("msfullscreenchange", this.onFullScreenListener);
  }

  public unbindDocumentListeners() {
    document.removeEventListener("fullscreenchange", this.onFullScreenListener);
    document.removeEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("msfullscreenchange", this.onFullScreenListener);
    this.onFullScreenListener = null;
  }

  public ngOnDestroy() {
    this.unbindDocumentListeners();
  }

  public galleriaClass() {
    return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
  }

  public fullScreenIcon() {
    return `pi ${this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'}`;
  }

  public imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

}
interface TagsGroup {
  label: string,
  value: string,
  items: Tag[],
}
interface Tag {
  tag: string,
  column: string,
}
