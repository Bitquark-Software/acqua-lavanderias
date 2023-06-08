import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
describe ( 'NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  beforeEach ( () => {
    TestBed.configureTestingModule ( {
      declarations: [NavbarComponent],
    } );
    fixture = TestBed.createComponent ( NavbarComponent );
    component = fixture.componentInstance;
    fixture.detectChanges ();
  } );
  it ( 'should create', () => {
    expect ( component ).toBeTruthy ();
  } );
  it ( 'should show all items when superAdmin is true', () => {
    component.isAdmin = true;
    fixture.detectChanges ();
    const navbarLinks = fixture.nativeElement.querySelectorAll ('.drawer-side > .menu > li') as HTMLElement[];
    expect ( navbarLinks.length ).toBe (5);
  } );
  it ( 'should show all items when superAdmin is false', () => {
    component.isAdmin = false;
    fixture.detectChanges ();
    const navbarLinks = fixture.nativeElement.querySelectorAll ('.drawer-side > .menu > li') as HTMLElement[];
    console.log (`length: ${navbarLinks.length}`);
    expect ( navbarLinks.length ).toBe (2);
  } );
} );
