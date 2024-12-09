import { NgModule, OnInit } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AnalysisComponent } from "./components/analysis/analysis.component";

const routes: Routes = [
    {
      path: '',
      component: AnalysisComponent,
    },
    {
      path: ':token',
      component: AnalysisComponent,
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AnalysisRoutingModule {
}