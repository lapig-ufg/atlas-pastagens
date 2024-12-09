import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { IndexComponent } from "./pages/index/index.component";
import { AboutCompenent } from "./pages/about/about.component";
import { MethodsComponent } from "./pages/methods/methods.component";
import { ArticlesComponent } from "./pages/articles/articles.component";
import { GalleriaComponent } from "./pages/galleria/galleria.component";
import { HelpComponent } from "./pages/help/help.component";

const routes: Routes = [
    {
        path: '',
        component: IndexComponent,
    },
    {
        path: 'home',
        component: IndexComponent,
    },
    {
        path: 'about',
        component: AboutCompenent,
    },
    {
        path: 'methods',
        component: MethodsComponent,
    },
    {
        path: 'articles',
        component: ArticlesComponent,
    },
    {
        path: 'gallery',
        component: GalleriaComponent,
    },
    {
        path: 'help',
        component: HelpComponent,
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HotsiteRoutingModule {}