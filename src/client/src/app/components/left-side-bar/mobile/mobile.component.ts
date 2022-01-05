import { Component, AfterViewInit } from '@angular/core';
import { LeftSideBarComponent } from '../left-side-bar.component';
import {
  HostListener,
} from '@angular/core';


import { MessageService } from "primeng/api";


@Component({
  selector: 'left-side-bar-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
  providers: [MessageService]
})

export class MobileComponent extends LeftSideBarComponent implements AfterViewInit {
  public region: any;

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.innerHeigthMobile = window.innerHeight - 250;
  }

  public innerHeigthMobile: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigthMobile = window.innerHeight - 250;
  }

  setTokenGeometryToSearch(token: number) {
    this.token = token;
    this.handleMenuMobile({
      index: 2,
      key: 'area',
      icon: 'fg-polygon-hole-pt',
      show: true
    }, true)
  }


  handleMenuMobile(menu, mobile = false) {

    this.menu.map(m => {
      return m.show = false
    });

    this.currentMenu = menu;
    this.layersTitle = this.localizationService.translate('menu.' + menu.key);

    // this.menu[menu.index].show = true;
    // this.layersSideBar = true;
    this.layersSideBarMobile = true;
    //this.onMenuSelected.emit({show: this.layersSideBarMobile, key: menu.key});

    if (menu.key == 'statistics') {
      this.displayStatisticsMobile = !this.displayStatisticsMobile;
      this.onNavBarToggle.emit(this.layersSideBarMobile);
      // let shand = document.getElementsByClassName('s-hand') as HTMLCollectionOf<HTMLElement>;
      //   if (shand.length != 0) {
      //     shand[0].style.transform = "display:block;";
      //   }
    }


  }

  onSideBarShowMobile() {
    const div = this.renderer.createElement('div');
    const img = this.renderer.createElement('img');
    this.renderer.addClass(div, 'header');
    this.renderer.addClass(img, 'logo');
    // this.renderer.setProperty(img, 'src', '../../../assets/logos/base_logo.png')
    this.renderer.setProperty(img, 'src', '../../../assets/logos/atlas_logo_01.png')
    this.renderer.setProperty(img, 'alt', 'Logo')
    this.renderer.appendChild(div, img);
    this.renderer.insertBefore(this.el.nativeElement.querySelector(".p-sidebar-header"), div, this.el.nativeElement.querySelector(".p-sidebar-close"))
  }

  updateRegion(region) {
    this.region = region;
  }

}
