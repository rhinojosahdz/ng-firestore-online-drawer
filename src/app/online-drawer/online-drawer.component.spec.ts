import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineDrawerComponent } from './online-drawer.component';

describe('OnlineDrawerComponent', () => {
  let component: OnlineDrawerComponent;
  let fixture: ComponentFixture<OnlineDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
