import { LOCALE_ID, NgModule } from "@angular/core";
import {CommonModule} from '@angular/common';

import { TranslateModule } from "@ngx-translate/core";

import { HotsiteRoutingModule } from "./hotsite-routing.module";

import { FilterPipe } from "../@core/pipes";

/**
 * PrimeNG.
 */
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from "primeng/multiselect";
import { AccordionModule } from 'primeng/accordion';

/**
 * Hotsite Components.
 */
import { IndexComponent } from "./pages/index/index.component";
import { BaseComponent } from "./pages/base/base.component";
import { AboutCompenent } from "./pages/about/about.component";
import { MethodsComponent } from "./pages/methods/methods.component";
import { ArticlesComponent } from "./pages/articles/articles.component";
import { FormsModule } from "@angular/forms";
import { GalleriaModule } from "primeng/galleria";
import { GalleriaComponent } from "./pages/galleria/galleria.component";
import { HelpComponent } from "./pages/help/help.component";

@NgModule({
    imports: [
        AccordionModule,
        CommonModule,
        FormsModule,
        GalleriaModule,
        ButtonModule,
        MultiSelectModule,
        HotsiteRoutingModule,
        TranslateModule,
        ToastModule,
    ],
    declarations: [
        IndexComponent,
        AboutCompenent,
        MethodsComponent,
        ArticlesComponent,
        GalleriaComponent,
        HelpComponent,
        BaseComponent,
        FilterPipe
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        ToastModule
    ]
})
export class HotsiteModule {}