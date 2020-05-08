import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCreateAltComponent } from './post-create-alt.component';

describe('PostCreateAltComponent', () => {
  let component: PostCreateAltComponent;
  let fixture: ComponentFixture<PostCreateAltComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostCreateAltComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCreateAltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
