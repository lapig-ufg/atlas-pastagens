import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RightSideBarComponent } from '../right-side-bar.component';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-right-side-bar-mobile',
  templateUrl: './right-side-bar-mobile.component.html',
  providers: [CustomerService],
  styleUrls: ['./right-side-bar-mobile.component.scss']
})
export class RightSideBarMobileComponent extends RightSideBarComponent implements OnInit {

  @Input() set region(value: boolean) {
    super.updateStatistics(value);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
