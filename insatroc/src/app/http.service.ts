import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PostModel} from './annonces/post_model';
import { Subject } from 'rxjs';
import { stringify } from 'querystring';

// injecter auth.service dedans
// pour demander à l'auth le token à rajouter au header
// le token doit être présent dans toutes les requêtes au backend
// mettre en place le service d'auth que là où il faut être authentifié
// un champ du header http contient le token
// rajouter http header aux requêtes
// rajouter ça dans les options de la méthode get et post du http client



// créer une fonction dans auth.service pour renvoyer le token vers les autres composants
// utiliser LocalStorage


// pour se déconnecter ?

// est-ce que le backend sait déchiffrer le token pour savoir quel utilisateur c'est ?

// c'est quoi exactement un token ?
// chaine de caractère aléatoire : hash -> infos de l'utilisateur

// dans node : utiliser un routeur pour vérifier ?
// déclarer une route publique et une route privée
// installer le middleware passport que sur les routes privées

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
    // console.log(this.posts.length);
  }
  getAllPosts(){
    //requete get http vers backend pour récuperer les annonces depuis la BD
    // this.http.get<{response:string, posts:PostModel []}>('http://localhost:3000/posts').subscribe(
      this.posts = [];
      this.http.get('http://localhost:3000/posts').subscribe(
      (data)=>{
        console.log("data");
        console.log(data);
        for(var i in data){
          this.posts.push({_id: data[i].AnnounceID, title: data[i].Title, description: data[i].Description, category: this.attributeCategory(data[i].CategoryID), price: data[i].Price, urls: null, date: data[i].PublicationDate, views: data[i].NbViews})
        }
        console.log(this.posts);
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

  attributeCategory(categoryID: number){
    var category = [];

    // for(let i in categoryID){
      switch (categoryID){
        case 1:
        category.push("Chambre");
        break;

        case 2:
        category.push("Cuisine");
        break;

        case 3:
        category.push("Salle de bain");
        break;

        case 4:
        category.push("Bureau");
        break;

        case 5:
        category.push("Loisirs/Sport");
        break;

        case 6:
        category.push("Autre");
        break;
        }
    // }
    return category;
  }
}
