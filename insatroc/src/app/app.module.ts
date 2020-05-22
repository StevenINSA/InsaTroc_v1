import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PostViewerComponent } from './annonces/post-viewer/post-viewer.component';
import { HeaderComponent } from './header/header.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PostCreateAltComponent } from './annonces/post-create-alt/post-create-alt.component';
import { ConnectionComponent} from './user/connection/connection.component';
import { CreateAccountComponent} from './user/create-account/create-account.component';
import { PostViewerByIdComponent } from './annonces/post-viewer-by-id/post-viewer-by-id.component';
import { UserPostsComponent } from './user/user-posts/user-posts.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { DeleteAccountDialog } from './user/user-profile/user-profile.component';
import { ChangePasswordDialog} from './user/user-profile/user-profile.component';
import { HttpAuthInterceptor } from './http-auth.interceptor';
import { SearchResultsComponent } from './annonces/search-results/search-results.component';
import { DeletePostDialog } from './annonces/post-viewer-by-id/post-viewer-by-id.component';
import { FillContactInfoDialog } from './annonces/post-create-alt/post-create-alt.component';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button/';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatStepperModule} from '@angular/material/stepper';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AppComponent,
    PostViewerComponent,
    HeaderComponent,
    HomepageComponent,
    PostCreateAltComponent,
    ConnectionComponent,
    CreateAccountComponent,
    PostViewerByIdComponent,
    UserPostsComponent,
    UserProfileComponent,
    DeleteAccountDialog,
    SearchResultsComponent,
    ChangePasswordDialog,
    DeletePostDialog,
    FillContactInfoDialog,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatExpansionModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    HttpClientModule,
    MatStepperModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  entryComponents: [
    DeleteAccountDialog,
    ChangePasswordDialog,
    DeletePostDialog,
    FillContactInfoDialog,
  ],
  providers: [
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
    {provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
