import { Component } from '@angular/core';
@Component ( {
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
} )
export class AppComponent {
  title = 'acqua-frontend';
  constructor(){
    if( this.title == 'acqua' ){
      this.title = 'app';
    }
  }
}
