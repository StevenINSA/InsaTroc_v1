import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostViewerByIdComponent } from './post-viewer-by-id.component';

describe('PostViewerByIdComponent', () => {
  let component: PostViewerByIdComponent;
  let fixture: ComponentFixture<PostViewerByIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostViewerByIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostViewerByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
