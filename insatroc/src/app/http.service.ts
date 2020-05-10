import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PostModel} from './annonces/post_model';
import { Subject } from 'rxjs';
import { stringify } from 'querystring';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private posts: PostModel[]= []
  public themeUpdater = new Subject<String>();

  constructor(private http: HttpClient) { }

  myMethod(){
    console.log('Hey, what\'s up?');
    // this.http.get('http://localhost:3000');
    this.http.get<{response:string}>('http://localhost:3000/').subscribe(
      (response) => { console.log(response)},
      (error) => {console.log(error)},
      // rediriger vers "/annonce/:id", id "étant l'ID de l'annonce qui est renvoyé par le serveur une fois qu'il l'a mise dans la DB"

    );
  }

  getPost(id: number){
    //return this.http.get('https://api.openbrewerydb.org/breweries')
    // return this.http.get('http://localhost:3000/post_viewer');
    this.http.get('http://localhost:3000/getPost/'+ id).subscribe(
      (response) => {console.log(response)},
      (error) => {console.log(error)},
    );
  }

  addPost(post:PostModel){
    //requete post http vers backend pour stocker post dans BD
    // this.posts.push(post);
    console.log(post);
    this.http.post<{response:string}>('http://localhost:3000/addPost',post).subscribe(
      (response) => { console.log(response)},
      (error) => {console.log(error)},
      // rediriger vers "/annonce/:id", id "étant l'ID de l'annonce qui est renvoyé par le serveur une fois qu'il l'a mise dans la DB"

    );
    console.log(this.posts.length);
  }
  getAllPosts(){
    //requete get http vers backend pour récuperer les annonces depuis la BD
    this.http.get<{response:string,posts:PostModel []}>('http://localhost:3000/posts').subscribe(
      (data)=>{
        console.log("data.posts");
        console.log(data.posts);
        this.posts=data.posts;
        console.log("data.response");
        console.log(data.response);
      }
    )
    return(this.posts);
  }


  onThemeUpdate(){
    return(this.themeUpdater.asObservable())
  }
  changetheme(theme?:String){
    this.themeUpdater.next(theme)

  }
}
