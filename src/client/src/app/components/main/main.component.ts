import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { MapService } from "../services/map.service";
import { LocalizationService } from "../../@core/internationalization/localization.service";
import { Descriptor } from "../../@core/interfaces";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit, AfterContentChecked {
  public openMenu: boolean;
  public showLayers: boolean;
  public limit: any;
  public descriptor: Descriptor;

  constructor(
    private mapService: MapService,
    private localizationService: LocalizationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.openMenu = true;
    this.showLayers = false;
  }

  ngOnInit(): void {
    this.getDescriptor();
  }
  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  getDescriptor() {
    this.mapService.getDescriptor(this.localizationService.currentLang()).subscribe((descriptor: Descriptor) => {
      setTimeout(() => this.descriptor = descriptor, 0);
    }, error => {
      console.error(error)
    });
  }

  onMenuSelected(item) {
    this.showLayers = item.show;
  }

  onSideBarToggle(isOpen) {
    this.showLayers = isOpen;
  }

  onMenuToggle(isOpen) {
    this.openMenu = isOpen;
  }

  onChangeLanguage() {
    this.getDescriptor();
  }
}

