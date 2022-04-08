import {Component, OnInit, ViewChild} from '@angular/core';
import { PrimeNGConfig } from "primeng/api";
import { Galleria } from "primeng/galleria";
import { GaleriaService } from "./galeria.service";
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss']
})
export class GaleriaComponent implements OnInit {
  tagsGroup: TagsGroup[];
  selectedTags: Tag[] = [{tag: "Pastagem", column: 'tag_1'}];

  images: any[] = [];

  showThumbnails: boolean;

  fullscreen: boolean = false;

  activeIndex: number = 0;

  onFullScreenListener: any;

  displayBasic: boolean;
  displayCustom: boolean;

  defaultTags: Tag[] = [{tag: "Pastagem", column: 'tag_1'}];

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

  @ViewChild('galleria') galleria: Galleria;

  constructor(
    private primengConfig: PrimeNGConfig,
    private galeriaService: GaleriaService,
    private localizationService: LocalizationService,
  ) {
    this.displayBasic = true;
    this.showThumbnails = true;
  }

  ngOnInit() {
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

  getTags(){
    this.galeriaService.getTags().subscribe(result => {
      this.tagsGroup = result.map(group => {
        group['label'] = this.localizationService.translate('hotsite.gallery.tags.' + group.value)
        return group;
      })
    })
  }

  getImages(){
    this.loading = true;
    this.galeriaService.getImages(this.defaultTags).subscribe(result => {
      this.images = result;
      this.loading = false;
    })
  }

  searchImages(tags){
    this.loading = true;
    const itens = tags.length > 0 ? tags : this.defaultTags;
    this.galeriaService.getImages(itens).subscribe(result => {
      this.images = result;
      this.activeIndex = 0;
      this.loading = false;
    })
  }

  onThumbnailButtonClick() {
    this.showThumbnails = !this.showThumbnails;
  }

  toggleFullScreen() {
    if (this.fullscreen) {
      this.closePreviewFullScreen();
    }
    else {
      this.openPreviewFullScreen();
    }
  }

  openPreviewFullScreen() {
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

  onFullScreenChange() {
    this.fullscreen = !this.fullscreen;
  }

  closePreviewFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    }
    else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    }
    else if (document['msExitFullscreen']) {
      document['msExitFullscreen']();
    }
  }

  bindDocumentListeners() {
    this.onFullScreenListener = this.onFullScreenChange.bind(this);
    document.addEventListener("fullscreenchange", this.onFullScreenListener);
    document.addEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.addEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.addEventListener("msfullscreenchange", this.onFullScreenListener);
  }

  unbindDocumentListeners() {
    document.removeEventListener("fullscreenchange", this.onFullScreenListener);
    document.removeEventListener("mozfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("webkitfullscreenchange", this.onFullScreenListener);
    document.removeEventListener("msfullscreenchange", this.onFullScreenListener);
    this.onFullScreenListener = null;
  }

  ngOnDestroy() {
    this.unbindDocumentListeners();
  }

  galleriaClass() {
    return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
  }

  fullScreenIcon() {
    return `pi ${this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'}`;
  }

  imageClick(index: number) {
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
