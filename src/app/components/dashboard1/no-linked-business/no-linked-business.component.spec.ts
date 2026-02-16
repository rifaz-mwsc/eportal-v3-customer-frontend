import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoLinkedBusinessComponent } from './no-linked-business.component';

describe('NoLinkedBusinessComponent', () => {
  let component: NoLinkedBusinessComponent;
  let fixture: ComponentFixture<NoLinkedBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoLinkedBusinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoLinkedBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
